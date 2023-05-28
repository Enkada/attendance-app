import { useContext, useState } from 'react';
import { axios } from '../../node_modules/@bundled-es-modules/axios';
import { Navigate } from '../../node_modules/react-router-dom/dist/index';
import { UserContext } from '../UserContext';


export default function LoginPage() {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [redirect, setRedirect] = useState(false);
    const {setUser} = useContext(UserContext);

    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = { login, password };
        axios.post("/users/login", formData)
        .then((response) => {
            console.log(response.data);
            if (response.data.success == 1) {
                const userData = response.data.user;
                userData.is_admin = userData.is_admin.data[0] == 1
                setUser(userData);
                setRedirect(true);
            }
        })
        .catch((error) => {
            console.error(error);
            // handle the error, like displaying an error message to the user
        });
    };

    if (redirect) {
        return <Navigate to={"/groups"}/>
    }

    return (
        <>
        <div className="login">
            <h1>Авторизация</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="login-input">Логин</label>
                <input
                    id="login-input"
                    type="text"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                />
                <label htmlFor="password-input">Пароль</label>
                <input
                    id="password-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            <button type="submit">Login</button>
            </form>
        </div>
        </>        
    );
}