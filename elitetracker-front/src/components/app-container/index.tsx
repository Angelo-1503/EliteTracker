import type { ReactNode } from 'react';
import styles from './styles.module.css';

type AppContainerprops = {
	children: ReactNode;
};

export function AppContainer({ children }: AppContainerprops) {
	return <div className={styles.app}>{children}</div>;
}
