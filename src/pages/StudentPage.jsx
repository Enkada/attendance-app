import React, { useEffect, useState } from 'react';
import { axios } from '../../node_modules/@bundled-es-modules/axios';
import { Link, useParams } from '../../node_modules/react-router-dom/dist/index';
import moment from 'moment';
import PeriodSelector from './PeriodSelector';
import $ from 'jquery';
import {getStudentStatRanges} from './Statistics';

function WeekStats(props) {
    if (!props)
        return;


    const [ignoredLessons, setIgnoredLessons] = useState([]);

    let timetables = props.timetables;
    let passages = props.passages;

    let passageListToRender = [];

    const lessonPeriods = {
        1: { start: "9:00", end: "10:30" },
        2: { start: "10:45", end: "12:15" },
        3: { start: "13:05", end: "14:35" },
        4: { start: "14:50", end: "16:20" },
        5: { start: "16:30", end: "18:00" },
    }

    const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']        
        
    let startDate = props.range.start >= 1 ? moment([props.year, props.month, props.range.start]) : moment([props.year, props.month, 1]).subtract(-1 * props.range.start + 1, "days");
    let daysInMonth = moment([props.year, props.month, 1]).daysInMonth();
    let endDate = props.range.end <= daysInMonth ? moment([props.year, props.month, props.range.end]) : moment([props.year, props.month, daysInMonth]).add(props.range.end - daysInMonth, "days");
    
    let periodPassages = passages.filter(x => moment(x.datetime).isBetween(startDate, endDate, null, '[true, true]'));
    let periodLessons = new Set();

    if (!periodPassages.length) {
        passageListToRender.push(<div key="noData" className='no-data'>Нет данных за указанный период</div>);
        return passageListToRender;
    }

    console.log(passages);

    function getClassBlock(classes, dayLessons, index) { 
        let lesson = dayLessons.find(x => x.index == index);
        if (lesson) 
            periodLessons.add(lesson.class);
        return (
            <div className={`graph-period lesson lesson-${index} ${classes[index]?.isSkipped ? "skipped" : ""} ${classes[index]?.isIgnored ? "ignored" : ""} ${lesson ? "active" : ""}`}>
                <div className="graph-period__time graph-period__time--start">{lessonPeriods[index].start}</div>
                <div className="graph-period__time graph-period__time--end">{lessonPeriods[index].end}</div>
                <div className="graph-period__time graph-period__index">{index}</div>
                {!!lesson && 
                <div className="graph-period__lesson-name">{lesson.class}</div>}
            </div>
        );
    }

    const handleTogglePassageList = (index) => {
        $(`#stat-day-${index}`).find('.week-stat__day__passage-list').slideToggle();
    };

    const handleToggleGraph = (index) => {
        $(`#stat-day-${index}`).find('.week-stat__day__graph').slideToggle();
    };

    const handleToggleLessonList = (index) => {
        $(`#stat-day-${index}`).find('.week-stat__day__lesson-table').slideToggle();
    };

    let weekStats = {
        minutes: 0, percentage: 1, classCount: 0, skippedClassCount: 0
    }

    for (let index = 0; index <= 5; index++) {
        let date = startDate.clone().add(index, "days");

        let dayPassages = periodPassages.filter(x => moment(x.datetime).isSame(date, "day"));

        let {total, classes, ranges} = getStudentStatRanges(timetables, passages, date.format('DD.MM.YY'), ignoredLessons);
        weekStats.classCount += total.classCount;

        let dayLessons = timetables.filter(timetable => moment(timetable.date).isSame(moment(date), 'day'));
        
        let statList = [];
        if (dayPassages.length > 0 && dayLessons.length > 0) {
            if (!isNaN(total.percentage)) {
                statList.push(<React.Fragment key={0}>
                    <div key="classCount">{total.classCount - total.skippedClassCount} / {total.classCount}</div>
                    <div key="minutes">{total.minutes} / {(90 * total.classCount)} мин.</div>
                    <div key="minutes-skipped">{90 * total.classCount - total.minutes} мин.</div>
                    <div key="percentage">{Math.round(total.percentage * 100)}%</div>
                </React.Fragment>)
                weekStats.minutes += total.minutes;
                weekStats.skippedClassCount += total.skippedClassCount;
            }
        }
        else if (!dayPassages.length) {
            statList.push(<div key="noPassages" className='no-data'>Нет данных о проходах</div>)
        }
        else if (!dayLessons.length) {
            statList.push(<div key="noLessons" className='no-data'>Нет данных о расписании</div>)
        }

        let passageLines = [];
        ranges.forEach((range, index) => {
            let length = range.end - range.start;
            passageLines.push(
                <div className="passage-line" key={-index} style={{['--start']: range.start, ['--length']: length}}></div>
            );
        });

        let lessonList = []
        for (let index = 1; index <= 5; index++) {
            const classStat = classes[index];
            classStat.uncoveredRange?.forEach(range => {
                let length = range.end - range.start;
                passageLines.push(
                    <div className="passage-line red" key={index} style={{['--start']: range.start, ['--length']: length}}></div>
                );
            });

            let lessonData = dayLessons.find(x => x.index == index);

            if (!lessonData || classStat.isIgnored)
                continue;
            lessonList.push(
                <div className="lesson-stat" key={index} style={{['--minutes']: classStat.minutes}}>
                    <div className="lesson-stat__index">{index}</div>
                    <div className="lesson-stat__name">{lessonData.class}</div>
                    <div className={`lesson-stat__is-skipped ${!!classStat.isSkipped && "skipped"}`}>{classStat.isSkipped ? "не был" : "был"}</div>
                    <div className="lesson-stat__minutes">{classStat.minutes} мин.</div>
                    <div className={`lesson-stat__minutes--skipped ${!!!(90 - classStat.minutes) && "gray"}`}>{90 - classStat.minutes} мин.</div>
                    <div className="lesson-stat__persentage">{Math.round(classStat.percentage * 100)}%</div>
                    <div className='lesson-stat__progressbar' role="progressbar" aria-valuenow="65" aria-valuemin="0" aria-valuemax="100" style={{['--value']: Math.round(classStat.percentage * 100)}}></div>
                </div>
            )
        }

        passageListToRender.push(
            <div className='week-stat__day' key={index} id={`stat-day-${index}`} style={{['--skipped']: total.skippedClassCount}}>
                <div className="week-stat__day__header">                    
                    <div className="week-stat__day__header__date">
                        <div>{dayNames[index]}</div>
                        <div>{date.format('DD.MM.YY')}</div>
                    </div>
                    <div className="week-stat__day__header__stat-list">{statList}</div>
                    {(!!dayLessons.length && !!dayPassages.length) && <div className='week-stat__day__header__progressbar' role="progressbar" aria-valuenow="65" aria-valuemin="0" aria-valuemax="100" style={{['--value']: Math.round(total.percentage * 100)}}></div>}
                    <div className="week-stat__day__header__btn-list">
                        {!!dayPassages.length && <span className='material-icons btn' onClick={(e) => handleTogglePassageList(index)}>list</span>}
                        {(!!dayLessons.length || !!dayPassages.length) && 
                            <span className='material-icons btn' onClick={(e) => handleToggleGraph(index)}>view_timeline</span>
                        }
                        {((!!dayLessons.length || !!dayPassages.length) && !!lessonList.length) &&                             
                            <span className='material-icons btn' onClick={(e) => handleToggleLessonList(index)}>event_note</span>
                        }
                    </div>
                </div>                    
                {!!dayPassages.length && <div className="week-stat__day__passage-list" style={{['display']: "none"}}>
                    {dayPassages.map(passage => (
                        <div className="passage" key={passage.id}>
                            <div className="passage__time">{moment(passage.datetime).format('HH:mm:ss')}</div>
                            <div className="passage__type">{passage.type.data == 1 ? <><span className="material-icons">login</span>Вход</> : <><span className="material-icons">logout</span>Выход</>}</div>
                            <div className="passage__building">{passage.building}</div>
                        </div>
                    ))}
                </div>}
                {(!!dayLessons.length || !!dayPassages.length) &&
                <div className="week-stat__day__graph day-graph" style={{['display']: "none"}}>
                    <div className="day-graph__period-list">
                        <div className="graph-period morning">
                            <div className="graph-period__time graph-period__time--start">7:30</div>
                            <div className="graph-period__time graph-period__time--end"></div>
                        </div>
                        {getClassBlock(classes, dayLessons, 1)}
                        <div className="graph-period break"></div>
                        {getClassBlock(classes, dayLessons, 2)}
                        <div className="graph-period break break--long"></div>
                        {getClassBlock(classes, dayLessons, 3)}
                        <div className="graph-period break"></div>
                        {getClassBlock(classes, dayLessons, 4)}
                        <div className="graph-period break break--short"></div>
                        {getClassBlock(classes, dayLessons, 5)}
                        <div className="graph-period evening">
                            <div className="graph-period__time graph-period__time--start"></div>
                            <div className="graph-period__time graph-period__time--end">20:00</div>
                        </div>
                    </div>
                    <div className="day-graph__passage-list">{passageLines}</div>
                </div>}
                {((!!dayLessons.length || !!dayPassages.length) && !!lessonList.length) && 
                    <div className="week-stat__day__lesson-table" style={{['display']: "none"}}>
                    <div className="week-stat__day__lesson-table__header">
                        <div>№</div>
                        <div>Предмет</div>
                        <div>Статус</div>
                        <div>Посещено</div>
                        <div>Пропущено</div>    
                    </div>                        
                    <div className="week-stat__day__lesson-table__list">{lessonList} </div> 
                </div> 
                }
            </div>
        )
    }

    passageListToRender.push(
        <div className='week-stat__day total' key={-1}>
            <div className="week-stat__day__header">
                <div className="week-stat__day__header__date">Итого</div>
                <div className="week-stat__day__header__stat-list">
                    <div>{weekStats.classCount - weekStats.skippedClassCount}/{weekStats.classCount}</div>
                    <div>{weekStats.minutes}/{(90 * weekStats.classCount)}</div>
                    <div>{Math.round((weekStats.minutes / (weekStats.classCount * 90))* 100) }%</div>
                </div>
            </div>
        </div>
    )

    const handleCheckboxChange = (lesson, isChecked) => {
        if (isChecked) {
            setIgnoredLessons(prevIgnoredLessons => [...prevIgnoredLessons, lesson]);
        } else {
            setIgnoredLessons(prevIgnoredLessons => prevIgnoredLessons.filter(l => l !== lesson));
        }
    };

    const handleToggleGraphAll = () => {
        $('.week-stat__day .week-stat__day__graph').each(function() {
            $(this).slideToggle();
        });
    };

    const handleTogglePassageListAll = () => {
        $('.week-stat__day .week-stat__day__passage-list').each(function() {
            $(this).slideToggle();
        });
    };

    const handleToggleLessonListAll = () => {
        $('.week-stat__day .week-stat__day__lesson-table').each(function() {
            $(this).slideToggle();
        });
    };

    const handleToggleIgnoredList = () => {
        $('.ignored-lessons').slideToggle();
        $('#btn-toggle-ignored').toggleClass('active');
    };

    return (
        <>
            <div className="btn-list">                
                <div onClick={handleToggleGraphAll} className='btn--material-icons'><span className='material-icons'>view_timeline</span>Все графики </div>
                <div onClick={handleTogglePassageListAll} className='btn--material-icons'><span className='material-icons'>list</span>Все проходы </div>
                <div onClick={handleToggleLessonListAll} className='btn--material-icons'><span className='material-icons'>event_note</span>Все занятия </div>
                <div onClick={handleToggleIgnoredList} id='btn-toggle-ignored' className='btn--material-icons'><span className='material-icons'>rule</span>Игнорируемые предметы </div>
            </div>
            <div className="ignored-lessons" style={{['display']: "none"}}>
                {Array.from(periodLessons).map((lesson, index) => (
                    <div key={index}>
                        <input type='checkbox' id={"cb-lesson-" + index} value={lesson} onChange={(e) => handleCheckboxChange(lesson, e.target.checked)}></input>
                        <label htmlFor={"cb-lesson-" + index}>{lesson}</label>
                    </div>
                ))}
            </div>
            <div className="week-stat">
                <div className="week-stat__header">
                    <div>Дата</div>
                    <div>Занятий</div>
                    <div>Посещено</div>
                    <div>Пропущено</div>
                    <div>Процент</div>
                </div>
                <div className='week-stat__day-list'>{passageListToRender}</div>
            </div>
        </>
    )
}

export default function StudentPage() {
    const [student, setStudent] = useState([]);
    const [passages, setPassages] = useState([]);
    const [timetables, setTimetables] = useState([]);
    const { id } = useParams();
    
    //const [isCustomPeriod, setIsCustomPeriod] = useState(false);
    
    const [calendarYear, setCalendarYear] = useState(2022);
    const [calendarMonth, setCalendarMonth] = useState(10);

    const [range, setRange] = useState({ start: 7, end: 13 });

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
        axios.get(`/students/${id}`).then(response => {
            setStudent(response.data.data);

            axios.get(`/timetables/group/${response.data.data.group_id}`).then(response => {
                setTimetables(response.data.data);
            });
        });
        axios.get(`/passages/${id}`).then(response => {
            setPassages(response.data.data);
        });
    }, []);    

    const getStatRangeText = () => {
        let startDate = range.start >= 1 ? moment([calendarYear, calendarMonth, range.start]) : moment([calendarYear, calendarMonth, 1]).subtract(-1 * range.start + 1, "days");
        let daysInMonth = moment([calendarYear, calendarMonth, 1]).daysInMonth();
        let endDate = range.end <= daysInMonth ? moment([calendarYear, calendarMonth, range.end]) : moment([calendarYear, calendarMonth, daysInMonth]).add(range.end - daysInMonth, "days");
        return (<>{startDate.format('DD.MM.YYYY')} - {endDate.format('DD.MM.YYYY')}</>)
    }

    return (
        <>
            <div className="student-title">                
                <div className="student-title__name">{student.fullname}</div>
                <Link to={`/group/${student.group}`} className="student-title__group btn--material-icons"><span className="material-icons">group</span><span>{student.group}</span></Link>
            </div>
            
            <section>
                <h2>Проходы студента</h2>
                <PeriodSelector timetables={timetables} passages={passages} onYearChange={handleYearChange} onMonthChange={handleMonthChange} onRangeChange={handleRangeChange}></PeriodSelector>
                
                
            </section>
            <section>
                <h2>Статистика за период {getStatRangeText()}</h2>
                <WeekStats timetables={timetables} passages={passages} year={calendarYear} month={calendarMonth} range={range}></WeekStats>                
            </section>
        </>
    )
}