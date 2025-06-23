import { GithubLogoIcon } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/button';
import styles from './styles.module.css';

export function Login() {
	const navigate = useNavigate();
	return (
		<div className={styles.container}>
			<div className={styles.content}>
				<h1>Entre com</h1>
				<Button
					onClick={() => {
						navigate('/');
					}}
				>
					<GithubLogoIcon />
					GitHub
				</Button>
				<p>
					Ao entrar, eu concordo com os Termos de Serviço e Política de
					Privacidade
				</p>
			</div>
		</div>
	);
}
