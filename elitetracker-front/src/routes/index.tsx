import { createBrowserRouter } from 'react-router-dom';
import { Habits } from '../screens/habits';
import { Login } from '../screens/login';

export const router = createBrowserRouter([
	{
		path: '/',
		element: <Habits />,
	},
	{
		path: '/entrar',
		element: <Login />,
	},
]);
