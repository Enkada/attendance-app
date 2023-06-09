import { useEffect, useState } from 'react';
import { axios } from '../../node_modules/@bundled-es-modules/axios';
import { Link, useParams } from '../../node_modules/react-router-dom/dist/index';
import GroupTimetable from './GroupTimetable';
import {getStudentStatRanges} from './Statistics';
import PeriodSelector from './PeriodSelector';
import $ from 'jquery';
import moment from 'moment';

export default function GroupPage() {
    const [students, setStudents] = useState([]);
    const { name } = useParams();

    const [passages, setPassages] = useState([]);
    const [timetables, setTimetables] = useState([]);

    const [calendarYear, setCalendarYear] = useState(2022);
    const [calendarMonth, setCalendarMonth] = useState(10);

    const [range, setRange] = useState({ start: 7, end: 13 });
    
    const [ignoredStudents, setIgnoredStudents] = useState([]);

    const [ignoredLessons, setIgnoredLessons] = useState([]); 

    const [isFakeDataDisplayed, setIsFakeDataDisplayed] = useState(false);    
    
    const handleLessonCheckboxChange = (lesson, isChecked) => {
        if (isChecked) {
            setIgnoredLessons(prevIgnoredLessons => [...prevIgnoredLessons, lesson]);
        } else {
            setIgnoredLessons(prevIgnoredLessons => prevIgnoredLessons.filter(l => l !== lesson));
        }
    };

    const [isCustomPeriod, setIsCustomPeriod] = useState(false);
    const [customPeriod, setCustomPeriod] = useState({ start: "2022-11-07", end: null });

    const handleCheckboxChange = (student, isChecked) => {
        if (isChecked) {
            setIgnoredStudents(prevIgnoredStudents => [...prevIgnoredStudents, student]);
        } else {
            setIgnoredStudents(prevIgnoredStudents => prevIgnoredStudents.filter(l => l !== student));
        }
    };

    const handleRangeChange = (newRange) => {
        setRange(newRange);
    };

    const handleYearChange = (newYear) => {
        setCalendarYear(newYear);
    };

    const handleMonthChange = (newMonth) => {
        setCalendarMonth(newMonth);
    };

    useEffect(() => {
        axios.get(`/groups/${name}/students`).then(response => {
            setStudents(response.data.data);
        });

        axios.get(`/timetables/${name}`).then(response => {
            setTimetables(response.data.data);
        });

        axios.get(`/passages/`).then(response => {
            setPassages(response.data.data);
        });
    }, []);

    function translit(word){
        var answer = '';
        word = word.toLowerCase();
        var converter = {
            'а': 'a',    'б': 'b',    'в': 'v',    'г': 'g',    'д': 'd',
            'е': 'e',    'ё': 'e',    'ж': 'zh',   'з': 'z',    'и': 'i',
            'й': 'y',    'к': 'k',    'л': 'l',    'м': 'm',    'н': 'n',
            'о': 'o',    'п': 'p',    'р': 'r',    'с': 's',    'т': 't',
            'у': 'u',    'ф': 'f',    'х': 'h',    'ц': 'c',    'ч': 'ch',
            'ш': 'sh',   'щ': 'sch',  'ь': '',     'ы': 'y',    'ъ': '',
            'э': 'e',    'ю': 'yu',   'я': 'ya',   ' ': '-'
        };
     
        for (var i = 0; i < word.length; ++i ) {
            if (converter[word[i]] == undefined){
                answer += word[i];
            } else {
                answer += converter[word[i]];
            }
        }
     
        return answer;
    }

    let periodLessons = new Set();

    timetables.forEach(timetable => {
        periodLessons.add(timetable.class);
    });


    let studentList = [];
    let totalPercentage = 0;

    students.forEach((student, index) => {
        let studentPassages = passages.filter(x => x.student_id == student.id);
        
        let startDate, endDate, dayCount;
        if (isCustomPeriod) {
            startDate = moment(customPeriod.start);
            endDate = moment(customPeriod.end);
            dayCount = endDate.diff(startDate, "days");
            console.log("DAY COUNT", dayCount);
        }
        else {
            startDate = range.start >= 1 ? moment([calendarYear, calendarMonth, range.start]) : moment([calendarYear, calendarMonth, 1]).subtract(-1 * range.start + 1, "days");
            let daysInMonth = moment([calendarYear, calendarMonth, 1]).daysInMonth();
            endDate = range.end <= daysInMonth ? moment([calendarYear, calendarMonth, range.end]) : moment([calendarYear, calendarMonth, daysInMonth]).add(range.end - daysInMonth, "days");
            dayCount = 5;
        }
        
        let total = { minutes: 0, classCount: 0, skippedClassCount: 0 };
        if (studentPassages.length > 0) {            
            while(startDate.isSameOrBefore(endDate)) {
                let stat = getStudentStatRanges(timetables, studentPassages, startDate.format('DD.MM.YY'), ignoredLessons);
                total.minutes += stat.total.minutes;
                total.classCount += stat.total.classCount;
                total.skippedClassCount += stat.total.skippedClassCount;
                startDate = startDate.add(1, 'days'); 
            }
            
        }
        else if (isFakeDataDisplayed && (![7, 8, 12, 21, 23].includes(index + 1))) {
            total.minutes += Math.round(Math.random() * (1070 - 270)) + 270;
            total.skippedClassCount += Math.round((1170 - total.minutes) / 90);
            total.classCount += 13;
        }
        else if (isFakeDataDisplayed) {
            total.classCount += 13;
            total.skippedClassCount += 13;
        }
        let isIgnored = ignoredStudents.find(x => x == student.fullname);

        if (!isIgnored && total.classCount > 0)
            totalPercentage += total.minutes / (total.classCount * 90);

        studentList.push(
            <div className={`student ${ignoredStudents.includes(student.fullname) ? "ignored" : ""}`} key={student.id} style={{['--skipped']: total.skippedClassCount}}>
                <div className="student__index">{index + 1}</div>
                <Link to={`/student/${student.id}/${translit(student.fullname)}`} className="student__fullname" key={student.id}>{student.fullname}</Link>
                {(!!passages.length && !!timetables.length) &&
                <>
                <div className="student__stat-list">
                    {!!total.classCount && <>
                        <div>{total.classCount - total.skippedClassCount} / {total.classCount} </div>
                        <div>{total.skippedClassCount}</div>                
                        <div>{total?.minutes} / {total.classCount * 90} </div>
                        <div>{Math.round(total?.minutes / (total.classCount * 90) * 100)}%</div>
                        <div className='student__progressbar' role="progressbar" aria-valuenow="65" aria-valuemin="0" aria-valuemax="100" style={{['--value']: Math.round(total?.minutes / (total.classCount * 90) * 100)}}></div>
                    </>}
                </div>
                <input type="checkbox" onChange={(e) => handleCheckboxChange(student.fullname, e.target.checked)}/>
                </>}
            </div>
        );
    });

    const getStatRangeText = () => {
        if (!isCustomPeriod) {
            let startDate = range.start >= 1 ? moment([calendarYear, calendarMonth, range.start]) : moment([calendarYear, calendarMonth, 1]).subtract(-1 * range.start + 1, "days");
            let daysInMonth = moment([calendarYear, calendarMonth, 1]).daysInMonth();
            let endDate = range.end <= daysInMonth ? moment([calendarYear, calendarMonth, range.end]) : moment([calendarYear, calendarMonth, daysInMonth]).add(range.end - daysInMonth, "days");
            return (<>{startDate.format('DD.MM.YYYY')} - {endDate.format('DD.MM.YYYY')}</>)
        }
        else {
            return (<>{moment(customPeriod.start).format('DD.MM.YYYY')} - {moment(customPeriod.end).format('DD.MM.YYYY')}</>)
        }
    }

    const handleIsCustomPeriodChange = (isCustom) => {
        setIsCustomPeriod(isCustom);
    };

    const handleCustomPeriodChange = (event, field) => {
        const { value } = event.target;
        setCustomPeriod(prevState => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleToggleIgnoredList = () => {
        $('.ignored-lessons').slideToggle();
        $('#btn-toggle-ignored').toggleClass('active');
    };

    const handleCheckSingle = (allLessons, lesson) => {
        setIgnoredLessons(Array.from(allLessons).filter(l => l !== lesson));
        console.log(ignoredLessons)
    };

    let hasData = passages.length && timetables.length;
    let isCustomPeriodIncorrect = isCustomPeriod && !(customPeriod.start && customPeriod.end);

    return (
        <>
            <h1>Группа {name}</h1>
            <section>
                {!!isCustomPeriodIncorrect && <div className='group-period'>Неверно выбран период</div>}
                {!!(hasData && !isCustomPeriodIncorrect) &&
                <>
                <div className='group-period'>Статистика за период {getStatRangeText()}</div>
                <input type="checkbox" className='cb-fake-data' onChange={(e) => {setIsFakeDataDisplayed(e.target.checked); console.log(e.target.checked);}}/>
                <div className="group-percentage">Процент общей посещаемости группы за период - {Math.round(totalPercentage / (students.length - ignoredStudents.length) * 100)}%</div>            
                <div className="btn-list">
                    <div onClick={handleToggleIgnoredList} id='btn-toggle-ignored' className='btn--material-icons'><span className='material-icons'>rule</span>Игнорируемые предметы </div>
                </div>
                <div className="ignored-lessons" style={{['display']: "none"}}>
                    <div className="ignored-lessons__list">
                    {Array.from(periodLessons).map((lesson, index) => (
                        <div key={index}>
                            <span className='btn material-icons' onClick={(e) => handleCheckSingle(periodLessons, lesson)}>playlist_add_check</span>
                            <input type='checkbox' id={"cb-lesson-" + index} value={lesson} checked={ignoredLessons.includes(lesson)} onChange={(e) => handleLessonCheckboxChange(lesson, e.target.checked)}></input>
                            <label htmlFor={"cb-lesson-" + index}>{lesson}</label>
                        </div>
                    ))}      
                    </div>                  
                    <div className="btn-list">
                        <div onClick={() => {setIgnoredLessons([])}} className='btn--material-icons btn-uncheck-all'><span className='material-icons'>playlist_remove</span>Снять выделение</div>
                        <div onClick={() => {setIgnoredLessons(Array.from(periodLessons))}} className='btn--material-icons btn-uncheck-all'><span className='material-icons'>checklist</span>Выбрать все</div>
                    </div>
                </div>
                </>
                }                
                <h2>Список студентов</h2>
                <div className="student-table">
                    <div className="student-table__header">
                        <div>№</div>
                        <div>ФИО</div>
                        {!!(hasData && !isCustomPeriodIncorrect) &&  <>
                        <div>Посещено</div>
                        <div>Пропущено</div>
                        <div>Посещено, мин.</div>
                        <div>Процент</div>
                        </>}
                    </div>
                    <div className="student-table__list">
                        {studentList} 
                    </div>
                </div>
                
            </section>
            {(!!passages.length && !!timetables.length) && <section>
                <h2><center>Выбор периода</center></h2>
                <PeriodSelector timetables={timetables} passages={passages} onCustomPeriodChange={handleCustomPeriodChange} onIsCustomPeriodChange={handleIsCustomPeriodChange} isGroup={true} onYearChange={handleYearChange} onMonthChange={handleMonthChange} onRangeChange={handleRangeChange}></PeriodSelector>
            </section>}
            <section>
                <h2>Расписание группы</h2>
                {timetables.length ? <GroupTimetable/> : <span>Расписание не найдено. <Link to="/import">Импортируйте</Link> файлы расписания занятий.</span>}                
            </section>
        </>
    )
}