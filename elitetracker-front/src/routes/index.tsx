import { createBrowserRouter } from 'react-router-dom';
import { Auth } from '../screens/auth';
import { Habits } from '../screens/habits';
import { Login } from '../screens/login';
import { PrivateRoute } from './private-route';

export const router = createBrowserRouter([
	{
		path: '/',
		element: <PrivateRoute component={<Habits />} />,
	},
	{
		path: '/entrar',
		element: <Login />,
	},
	{
		path: '/autenticacao',
		element: <Auth />,
	},
]);
