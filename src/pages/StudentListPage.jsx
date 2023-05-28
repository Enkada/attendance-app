import { useContext, useEffect, useState } from 'react';
import { axios } from '../../node_modules/@bundled-es-modules/axios';
import { Link } from '../../node_modules/react-router-dom/dist/index';

export default function StudentListPage() {
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        axios.get('/students').then(response => { setStudents(response.data.data) });
    }, []);

    let studentListToRender = []

    const handleSearch = (e) => {
        setSearch(e.target.value)
    }

    let foundStudents = students.filter(x => x.fullname.toLowerCase().includes(search.toLowerCase()));

    return (
        <>
            <h1>Список студентов</h1>
            <section>
                <div className="student-search">
                    <input type="search" onChange={(e) => handleSearch(e)} placeholder='Введите имя студента'/>
                    <div className="student-search__status">{foundStudents.length > 0 ? `Найдено: ${foundStudents.length} ${foundStudents.length > 50 ? "(отображается 50)" : ""}` : `По запросу \"${search}\" ничего не найдено`}</div>
                    <div className="student-search__list">
                        {foundStudents.slice(0, 50).map((student, index) => (
                            <div className="student-search__student" key={index}>
                                <div className="student-search__student__name"><Link to={`/student/${student.id}/stats`}>{student.fullname}</Link></div>
                                <div className="student-search__student__group"><Link to={`/group/${student.group}`}>{student.group}</Link></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    )
}