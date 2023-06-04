import React, { useEffect, useState } from 'react';
import moment from 'moment';

export default function PeriodSelector(props) {
    if (!props)
        return;

    let { passages, timetables, onRangeChange, onCustomPeriodChange, onIsCustomPeriodChange, onYearChange, onMonthChange, isGroup } = props;

    const [isCustomPeriod, setIsCustomPeriod] = useState(false);
    const [customPeriod, setCustomPeriod] = useState({ start: "2022-11-07", end: null });
    
    const [calendarYear, setCalendarYear] = useState(2022);
    const [calendarMonth, setCalendarMonth] = useState(10);
    const [range, setRange] = useState({ start: 7, end: 13 });

    const handleRangeChange = (newRange) => {
        setRange(newRange);
        onRangeChange(newRange);
    };

    useEffect(() => {
        onIsCustomPeriodChange(isCustomPeriod);
    }, [isCustomPeriod]);

    const handleDateChange = (event, field) => {
        const { value } = event.target;
        setCustomPeriod(prevState => ({
            ...prevState,
            [field]: value,
        }));
        onCustomPeriodChange(event, field);
    };

    return (
        <div className="period-selector">            
            <div>
                <input type="radio" name="range-input" value="custom" id="period-custom" checked={isCustomPeriod} onChange={(e) => setIsCustomPeriod(e.target.value === 'custom')}/>
                <label htmlFor="period-custom">Свой период</label>
            </div>
            <div className={`custom-period ${!isCustomPeriod ? "hidden" : ""}`}>
                <label htmlFor="period-custom__start">От</label>
                <input type="date" id="period-custom__start" value={customPeriod.start || ''} onChange={event => handleDateChange(event, 'start')}/>
                <label htmlFor="period-custom__end">До</label>
                <input type="date" id="period-custom__end" value={customPeriod.end || ''} onChange={event => handleDateChange(event, 'end')}/>
            </div>
            <div>
                <input type="radio" name="range-input" value="calendar" id="period-calendar" checked={!isCustomPeriod} onChange={(e) => setIsCustomPeriod(e.target.value === 'custom')}/>
                <label htmlFor="period-calendar">Календарь</label>
            </div>
            <div className={`calendar ${isCustomPeriod ? "hidden" : ""}`}>
                <div className="calendar__header">
                    <input type="number" onChange={(e) => {setCalendarYear(e.target.value); onYearChange(e.target.value)}} value={calendarYear}/>
                    <select value={calendarMonth} onChange={(e) => {setCalendarMonth(e.target.value); onMonthChange(e.target.value)}}>
                        <option value="0">Январь</option>
                        <option value="1">Февраль</option>
                        <option value="2">Март</option>
                        <option value="3">Апрель</option>
                        <option value="4">Май</option>
                        <option value="5">Июнь</option>
                        <option value="6">Июль</option>
                        <option value="7">Август</option>
                        <option value="8">Сентябрь</option>
                        <option value="9">Октябрь</option>
                        <option value="10">Ноябрь</option>
                        <option value="11">Декабрь</option>
                    </select>
                </div>
                <div className="calendar__grid">
                    <div className="calendar__day-names">
                        <div>Пн</div>
                        <div>Вт</div>
                        <div>Ср</div>
                        <div>Чт</div>
                        <div>Пт</div>
                        <div>Сб</div>
                        <div>Вс</div>
                    </div>
                    <CalendarGrid timetables={timetables} isGroup={isGroup} passages={passages} year={calendarYear} month={calendarMonth} onRangeChange={handleRangeChange}></CalendarGrid>
                </div>
            </div>
        </div>
    )
}

function CalendarGrid(props) {
    const [range, setRange] = useState({ start: 7, end: 13 });

    if (!props)
        return;

    let dayOffset = new Date(props.year, props.month, 0).getDay();
    let dayCount = new Date(props.year, props.month * 1 + 1, 0).getDate();
    let rows = [];
    let calendarData = [
        []
    ];

    if (dayOffset != 0) {
        let size = dayOffset == 0 ? 1 : dayOffset;
        for (let index = 1; index <= size; index++) {
            let day = new Date(props.year, props.month, -size + index).getDate();
            calendarData[0].push(<div key={index - size} data-day={index - size} className={`calendar__day another-month ${getDayColorClass(day, props.month - 1)}`}>{day}</div>);            
        }
    }

    function getDayColorClass(day, month = props.month, year = props.year) {
        let date = moment([year, month, day]);
        let hasLessons = props.timetables.filter(timetable => moment(timetable.date).isSame(date, 'day')).length > 0;
        let hasPassages = props.passages.filter(x => moment(x.datetime).isSame(date, "day")).length > 0;

        if (hasLessons && hasPassages) {
            return "has-data";
        } 
        else if (hasLessons) {
            return "no-passages";
        }
        else if (hasPassages && !props.isGroup) {
            return "no-lessons"
        }
        else {
            return "no-data";
        }
    }

    let rowIndex = 0;
    for (let index = 1; index <= dayCount; index++) {
        let day = new Date(props.year, props.month, index).getDay();

        if (day == 1 && index != 1) {
            calendarData.push([]);
            rowIndex++;
        }

        let row = calendarData[rowIndex];
        row.push(<div key={index} data-day={index} className={`calendar__day ${getDayColorClass(index)}`}>{index}</div>);
    }

    if (calendarData[rowIndex].length < 7) {
        let size = 7 - calendarData[rowIndex].length;
        for (let index = 1; index <= size; index++) {
            calendarData[rowIndex].push(<div key={index} data-day={dayCount + index} className={`calendar__day another-month ${getDayColorClass(index, props.month + 1)}`}>{index}</div>);            
        }
    }

    calendarData.forEach((days, index) => {
        let start = days[0].props["data-day"];
        let end = days[days.length - 1].props["data-day"];
        rows.push(
            <div key={index} data-start={start} data-end={end} className={`calendar__row ${!!(range.start == start && range.end == end) && "selected"}`} onClick={(e) => handleRowClick(e)}>
                {days}
            </div>
        );
    });

    const handleRowClick = (e) => {
        let newRange = { start: e.currentTarget.dataset.start, end: e.currentTarget.dataset.end }
        setRange(newRange);
        props.onRangeChange(newRange);
    };

    return (
        <div className="calendar__row-list">{rows}</div>
    )
}

