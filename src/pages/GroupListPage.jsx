import { useContext, useEffect, useState } from 'react';
import { axios } from '../../node_modules/@bundled-es-modules/axios';
import { Link } from '../../node_modules/react-router-dom/dist/index';
import { UserContext } from '../UserContext';

export default function GroupListPage() {
    const {user} = useContext(UserContext);
    const [groups, setGroups] = useState([]);
    const [userGroups, setUserGroups] = useState([]);

    useEffect(() => {
    }, []);

    useEffect(() => {
        axios.get('/users/groups/' + user?.id ).then(response => { setUserGroups(response.data.data) });
        axios.get('/groups').then(response => { setGroups(response.data.data) });
    }, [user]);

    let groupListToRender = []

    const generateGroupListByYear = () => {
        let userControlledGroup = groups;

        if (groups.length == 0) {
            groupListToRender = <section>Не найдено групп в базе данных. <Link to="/import">Импортируйте</Link> файлы контингента.</section>
            return;
        }

        if (user && !user.is_admin) {            
            let userGroupIds = userGroups.map(x => x.group_id);
            userControlledGroup = groups.filter(x => userGroupIds.includes(x.id));
        }

        if (userControlledGroup.length == 0) {
            groupListToRender = <section>Для Вас еще не назначены группы.</section>
            return;
        }

        for (let index = 1; index <= 4; index++) {
            const group = groups[index];
            groupListToRender.push(
                <div className='group-year' key={index} style={{['--index']: index}}>
                    <div className="group-year__title">{index} курс</div>
                    <div className="group-year__list">
                        {userControlledGroup.filter(g => g.year == index).map(group => (
                            <Link to={`/group/${group.name}`} className="group" key={group.id}>{group.name}</Link>
                        ))}  
                    </div>
                </div>
            )
        }
    }

    generateGroupListByYear();

    return (
        <>
            <h1>Список групп</h1>
            <div className="group-list">
                {groupListToRender}
            </div>
        </>
    )
}