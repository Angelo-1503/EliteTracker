import { Indicator } from '@mantine/core';
import { Calendar } from '@mantine/dates';
import { Minus, Plus, Timer } from '@phosphor-icons/react';
import dayjs from 'dayjs';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTimer } from 'react-timer-hook';
import { Button } from '../../components/button';
import { Header } from '../../components/header';
import { Info } from '../../components/info';
import { api } from '../../services/api';
import styles from './styles.module.css';
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');

type Timers = {
	focus: number;
	rest: number;
};

type FocusMetrics = {
	_id: [number, number, number];
	count: number;
};

type FocusTime = {
	_id: string;
	timeFrom: string;
	timeTo: string;
	userId: string;
	createdAt: String;
	updatedAt: string;
};

enum TimerState {
	PAUSED = 'PAUSED',
	FOCUS = 'FOCUS',
	REST = 'REST',
}

const TimerStateTitle = {
	[TimerState.PAUSED]: 'Pausado',
	[TimerState.FOCUS]: 'Em foco',
	[TimerState.REST]: 'Em descanso',
};

export function Focus() {
	const focusInput = useRef<HTMLInputElement>(null);
	const restInput = useRef<HTMLInputElement>(null);
	const [timers, setTimers] = useState<Timers>({ focus: 0, rest: 0 });
	const [timerState, setTimerState] = useState<TimerState>(TimerState.PAUSED);
	const [timeFrom, setTimeFrom] = useState<Date | null>(null);
	const [remainingFocusSeconds, setRemainingFocusSeconds] = useState<
		number | null
	>(null);
	const [focusMetrics, setFocusMetrics] = useState<FocusMetrics[]>([]);
	const [focusTimes, setFocusTimes] = useState<FocusTime[]>([]);
	const [currentMonth, setCurrentMonth] = useState<dayjs.Dayjs>(
		dayjs().startOf('month'),
	);
	const [currentDate, setCurrentDate] = useState<dayjs.Dayjs>(
		dayjs().startOf('day'),
	);

	function addSeconds(date: Date, seconds: number) {
		const time = dayjs(date).add(seconds, 'seconds');

		return time.toDate();
	}

	function handleStart() {
		restTimer.pause();
		const now = new Date();

		focusTimer.restart(addSeconds(now, timers.focus * 60));

		setTimeFrom(now);
	}

	async function handleEnd() {
		focusTimer.pause();
		await api.post('/focus-time', {
			timeFrom: timeFrom?.toISOString(),
			timeTo: new Date().toISOString(),
		});

		setTimeFrom(null);
	}

	const focusTimer = useTimer({
		expiryTimestamp: new Date(),
		async onExpire() {
			if (timerState !== TimerState.PAUSED) {
				await handleEnd();
			}
		},
	});

	const restTimer = useTimer({
		expiryTimestamp: new Date(),
	});

	function handleAddMinutes(type: 'focus' | 'rest') {
		if (type === 'focus') {
			const currentValue = Number(focusInput.current?.value);

			if (focusInput.current) {
				const value = currentValue + 5;
				focusInput.current.value = String(value);

				setTimers((old) => ({
					...old,
					focus: value,
				}));
			}

			return;
		}

		const currentValue = Number(restInput.current?.value);

		if (restInput.current) {
			const value = currentValue + 5;
			restInput.current.value = String(value);

			setTimers((old) => ({
				...old,
				rest: value,
			}));
		}
	}

	function handleRemoveMinutes(type: 'focus' | 'rest') {
		if (type === 'focus') {
			const currentValue = Number(focusInput.current?.value);

			if (focusInput.current) {
				const value = currentValue - 5;
				focusInput.current.value = String(value);

				setTimers((old) => ({
					...old,
					focus: value,
				}));
			}

			return;
		}

		const currentValue = Number(restInput.current?.value);

		if (restInput.current) {
			const value = currentValue - 5;
			restInput.current.value = String(value);

			setTimers((old) => ({
				...old,
				rest: value,
			}));
		}
	}

	function handleCancel() {
		setTimers({
			focus: 0,
			rest: 0,
		});

		setTimerState(TimerState.PAUSED);

		if (focusInput.current) {
			focusInput.current.value = '';
		}

		if (restInput.current) {
			restInput.current.value = '';
		}
	}

	function handleFocus() {
		if (timers.focus <= 0 || timers.rest <= 0) {
			return;
		}
		handleStart();
		setTimerState(TimerState.FOCUS);
	}

	async function handleRest() {
		await handleEnd();

		const now = new Date();

		const secondsLeft = focusTimer.minutes * 60 + focusTimer.seconds;

		setRemainingFocusSeconds(secondsLeft);

		restTimer.restart(addSeconds(now, timers.rest * 60));
		setTimerState(TimerState.REST);
	}

	function handleResume() {
		const now = new Date();

		if (remainingFocusSeconds !== null) {
			focusTimer.restart(addSeconds(now, remainingFocusSeconds));
			setRemainingFocusSeconds(null);
			setTimerState(TimerState.FOCUS);
		}
	}

	async function loadFocusMetrics(currentMonth: string) {
		const { data } = await api.get<FocusMetrics[]>('/focus-time/metrics', {
			params: {
				date: currentMonth,
			},
		});

		setFocusMetrics(data);
	}

	async function loadFocusTimes(currentDate: string) {
		const { data } = await api.get<FocusTime[]>('/focus-time', {
			params: {
				date: currentDate,
			},
		});

		setFocusTimes(data);
	}

	const metricsInfoByDay = useMemo(() => {
		const timesMetrics = focusTimes.map((item) => ({
			timeFrom: dayjs(item.timeFrom),
			timeTo: dayjs(item.timeTo),
		}));

		let totalTimeInMinutes = 0;

		if (timesMetrics.length) {
			for (const { timeFrom, timeTo } of timesMetrics) {
				const diff = timeTo.diff(timeFrom, 'minutes');

				totalTimeInMinutes += diff;
			}
		}

		return {
			timesMetrics,
			totalTimeInMinutes,
		};
	}, [focusTimes]);

	const metricsInfoByMonth = useMemo(() => {
		const completedDates: string[] = [];
		let counter: number = 0;

		if (focusMetrics.length) {
			focusMetrics.forEach((item) => {
				const date = dayjs(`${item._id[0]}-${item._id[1]}-${item._id[2]}`)
					.startOf('day')
					.toISOString();

				completedDates.push(date);
				counter += item.count;
			});
		}

		return { completedDates, counter };
	}, [focusMetrics]);

	async function handleSelectMonth(date: Date) {
		setCurrentMonth(dayjs(date));
	}

	async function handleSelectDay(date: Date) {
		setCurrentDate(dayjs(date));
	}

	useEffect(() => {
		loadFocusMetrics(currentMonth.toISOString());
	}, [currentMonth]);

	useEffect(() => {
		loadFocusTimes(currentDate.toISOString());
	}, [currentDate]);

	return (
		<div className={styles.container}>
			<div className={styles.content}>
				<Header title="Tempo de Foco" />
				<div className={styles['input-group']}>
					<div className={styles.input}>
						<Plus onClick={() => handleAddMinutes('focus')} />
						<Minus onClick={() => handleRemoveMinutes('focus')} />
						<input
							ref={focusInput}
							placeholder="Tempo de foco"
							type="number"
							disabled
						/>
					</div>

					<div className={styles.input}>
						<Plus onClick={() => handleAddMinutes('rest')} />
						<Minus onClick={() => handleRemoveMinutes('rest')} />
						<input
							ref={restInput}
							placeholder="Tempo de descanso"
							type="number"
							disabled
						/>
					</div>
				</div>
				<div className={styles.timer}>
					<strong>{TimerStateTitle[timerState]}</strong>
					{timerState === TimerState.PAUSED && (
						<span>{`${String(timers.focus).padStart(2, '0')}:00`}</span>
					)}

					{timerState === TimerState.FOCUS && (
						<span>{`${String(focusTimer.minutes).padStart(2, '0')}:${String(focusTimer.seconds).padStart(2, '0')}`}</span>
					)}

					{timerState === TimerState.REST && (
						<span>{`${String(restTimer.minutes).padStart(2, '0')}:${String(restTimer.seconds).padStart(2, '0')}`}</span>
					)}
				</div>

				<div className={styles['button-group']}>
					{timerState === TimerState.PAUSED && (
						<Button
							onClick={handleFocus}
							disabled={timers.focus <= 0 || timers.rest <= 0}
						>
							Começar
						</Button>
					)}
					{timerState === TimerState.FOCUS && (
						<Button onClick={handleRest}>Iniciar descanso</Button>
					)}
					{timerState === TimerState.REST && (
						<Button onClick={handleResume}>Retomar</Button>
					)}

					<Button onClick={handleCancel} variant="error">
						Cancelar
					</Button>
				</div>
			</div>
			<div className={styles.metrics}>
				<h2>Estatísticas</h2>

				<div className={styles['info-container']}>
					<Info
						value={String(metricsInfoByMonth.counter)}
						label="Ciclos totais"
					/>
					<Info
						value={`${metricsInfoByDay.totalTimeInMinutes} minutos`}
						label="Tempo total de foco"
					/>
				</div>
				<div className={styles['focus-list']}>
					<h2>{currentDate.format('D [de] MMMM')}</h2>
					{metricsInfoByDay.timesMetrics.map(({ timeFrom, timeTo }, index) => {
						const duration = timeTo.diff(timeFrom, 'minutes');
						return (
							<div key={index} className={styles['focus-item']}>
								<div className={styles['focus-time']}>
									<Timer color="var(--info)" />
									<span>
										{timeFrom.format('HH:mm')} - {timeTo.format('HH:mm')}
									</span>
								</div>
								<p>{duration} minutos</p>
							</div>
						);
					})}
				</div>

				<div className={styles['calendar-container']}>
					<Calendar
						getDayProps={(date) => ({
							selected: dayjs(date).isSame(currentDate),
							onClick: async () => await handleSelectDay(date),
						})}
						onMonthSelect={handleSelectMonth}
						onNextMonth={handleSelectMonth}
						onPreviousMonth={handleSelectMonth}
						renderDay={(date) => {
							const day = dayjs(date).date();
							const isSameDate = metricsInfoByMonth.completedDates.some(
								(item) => dayjs(item).isSame(dayjs(date)),
							);
							return (
								<Indicator
									size={8}
									color="var(--info)"
									offset={-2}
									disabled={!isSameDate}
								>
									<div>{day}</div>
								</Indicator>
							);
						}}
					/>
				</div>
			</div>
		</div>
	);
}
