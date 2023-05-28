import { axios } from '../../node_modules/@bundled-es-modules/axios';
import { useEffect, useState } from 'react';
import $ from 'jquery';

export default function TeacherListPage() {
    const [fullname, setName] = useState("");
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");

    const [users, setUsers] = useState([]);
    const [userGroups, setUserGroups] = useState([]);
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        axios.get("/users").then((response) => {  setUsers(response.data.data); });
        axios.get("/groups").then((response) => {  setGroups(response.data.data); });
        axios.get("/users/all-groups/fapah").then((response) => {  setUserGroups(response.data.data); });
    }, []);

    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = { fullname, login, password };
        console.log(formData);
        
        axios.post("/users", formData)
        .then((response) => {
            axios.get("/users").then((response) => {  setUsers(response.data.data); });
        })
        .catch((error) => {
            console.error(error);
        });
    };

    const handleDelete = (id) => {
        axios.delete(`/users`, { data: { id: id } })
        .then((response) => {
            setUsers(users.filter((user) => user.id !== id));
        });
    };

    const handleAddGroup = (id) => {
        let group = $('#select-user' + id).val();

        let userGroup = { teacher_id: id, group_id: group };

        axios.post("/users/groups", userGroup)
        .then((response) => {            
            axios.get("/users/all-groups/fapah").then((response) => {  setUserGroups(response.data.data); });
        })
    };

    const handleDeleteGroup = (id) => {
        console.log(id);
        axios.delete(`/users/groups`, { data: { id: id } })
        .then((response) => {
            setUserGroups(userGroups.filter((userGroup) => userGroup.id !== id));
        });
    };

    return (
        <>
        <h1>Панель администратора</h1>
        <section>
            <h2>Список аккаунтов</h2>
            <div className="user-list">
            {users.map((user) => (
                <div className={`user ${!!(user.is_admin.data[0]) && "admin"}`} key={user.id}>
                    <div className="user__header">
                        <div className="user__header__fullname">{user.fullname}</div>
                        <div className="user__header__login">({user.login})</div>
                        {!!(user.is_admin.data[0] == 0) ? 
                            <div onClick={() => handleDelete(user.id)} className="user__btn-delete"><span className="material-icons btn">delete</span></div> 
                        :
                            <div className="user__header__admin">Нельзя удалить аккаунт администратора</div>
                        }
                    </div>
                    <div className="user__groups">
                        <div className="user__groups__title">Курируемые группы</div>
                        <div className="user__groups__list">
                            {userGroups?.filter(x => x.teacher_id == user.id).map((userGroup) => (
                                <div onClick={() => handleDeleteGroup(userGroup.id)} key={userGroup.id} className='user-group'>{groups.find(x => x.id == userGroup.group_id).name}</div>
                            ))}
                        </div>
                        <div className="user__groups__menu">
                            <select id={"select-user" + user.id} >
                                {groups.map((group) => (<option key={group.id} value={group.id}>{group.name}</option>))}
                            </select>                            
                            <div className="btn--material-icons" onClick={() => handleAddGroup(user.id)}><span className='material-icons'>add</span> Добавить</div>
                        </div>
                    </div>
                </div>
            ))}
            </div>
        </section>
        <section>
            <h2>Добавить преподавателя</h2>
            <form onSubmit={handleSubmit}>
                <label htmlFor="fullname-input">ФИО:</label>
                <input
                    id="fullname-input"
                    type="text"
                    value={fullname}
                    onChange={(e) => setName(e.target.value)}
                />
                <label htmlFor="login-input">Логин:</label>
                <input
                    id="login-input"
                    type="text"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                />
                <label htmlFor="password-input">Пароль:</label>
                <input
                    id="password-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Добавить</button>
            </form>
        </section>
        </>
    );
}