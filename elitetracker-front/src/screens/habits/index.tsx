import { PaperPlaneRightIcon, TrashIcon } from '@phosphor-icons/react';

import { Sidebar } from '../../components/sidebar';
import styles from './styles.module.css';

export function Habits() {
	return (
		<div className={styles.app}>
			<Sidebar />
			<div className={styles.container}>
				<div className={styles.content}>
					<header>
						<h1>Hábitos Diários</h1>
						<span>Hoje, 27 de fevereiro</span>
					</header>
					<div className={styles.input}>
						<input placeholder="Digite aqui um novo hábito" type="text" />
						<PaperPlaneRightIcon />
					</div>
					<div className={styles.habits}>
						{Array(6)
							.fill(1)
							.map((_, index) => (
								<div key={index} className={styles.habit}>
									<p>Estudar Espanhol</p>
									<div>
										<input type="checkbox" name="" id="" />
										<TrashIcon />
									</div>
								</div>
							))}
					</div>
				</div>
			</div>
		</div>
	);
}
