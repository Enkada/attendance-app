import { axios } from '../../node_modules/@bundled-es-modules/axios';
import { useState } from 'react';

export default function AdminPage() {
    function getapi() {
        axios.get('/test');
        console.log('get request sent');
    }

    const [fullname, setFullName] = useState('');
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');

    return (
        <>
            <h1>Панель администратора</h1>
            <section>
                <h2>Пользователи</h2>
                <form>
                    <label htmlFor="">ФИО</label>
                    <input type="text"/>
                    <label htmlFor="">Логин</label>
                    <input type="text"/>
                    <label htmlFor="">Пароль</label>
                    <input type="password"/>
                    <button>Добавить</button>
                </form>
            </section>
        </>
    )
}