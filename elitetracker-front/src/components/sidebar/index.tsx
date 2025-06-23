import { ListChecksIcon, SignOutIcon } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import styles from './styles.module.css';

export function Sidebar() {
	return (
		<div className={styles.container}>
			<img src="https://github.com/Angelo-1503.png" alt="" />
			<div className={styles.links}>
				<Link to="/">
					<ListChecksIcon />
				</Link>
			</div>
			<SignOutIcon className={styles.signout} />
		</div>
	);
}
