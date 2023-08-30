"use client"

import { useState, useRef, useEffect, ChangeEvent } from 'react';
import styles from './/name-picker.module.css';
import { M_PLUS_1 } from 'next/font/google';

interface PickInfo {
    pickOrder: Number,
    names: string[]
}

function getRandomIntInclusive(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}

function PickHistory({pickInfos} : {pickInfos: PickInfo[]}) {
    return (
        <>
            {pickInfos.map((pick, index) => (
                <div key={index}>
                    <h2>Pick: {pick.pickOrder.toString()}</h2>

                    {pick.names.map((name, index) => (
                        <div key={index}>
                            <h2>{name}</h2>
                        </div>
                    ))}
                </div>
            ))}
        </>
    )
}

function PickList({nameList} : {nameList: string[]}) {
    return (
        <>
            <ul>
                {nameList.map(name => <li key={name}>{name}</li>)}
            </ul>
        </>
    )
}

function CsvReader({setList} : {setList: Function}) {
    const inputRef = useRef<HTMLInputElement>(null);
    
    const handleImport = (evt: ChangeEvent<HTMLInputElement>) => {
        if (evt.target == null) return;
        if (evt.target.files == null) return;

        // getting a hold of the file reference
        var file = evt.target.files[0];

        // setting up the reader
        var reader = new FileReader();
        reader.readAsText(file,'UTF-8');

        // here we tell the reader what to do when it's done reading...
        reader.onload = readerEvent => {
            if (readerEvent.target === null) return;
            var content = readerEvent.target.result;

            if (content === null) return;
            var nameList = content.toString().split(/(?:;|,|\n|\r)/);
            nameList = nameList.filter( (el) => el !== '');
            setList(nameList);
            console.log( 'file read', nameList );
        }
    };

    return (
        <>
            <button onClick={() => { if (inputRef.current != null) inputRef.current.click();}}>Import</button>
            <input ref={inputRef} type='file' accept='.txt, .csv' style={{display: 'none'}} onChange={handleImport}></input>
        </>
    );
}

export default function NamePicker() {
    const [nameList, setNameList] = useState([]);
    const [numPicks, setNumPicks] = useState(1);
    const [canDraw, setCanDraw] = useState(false);
    const [drawnList, setDrawnList] = useState<string[]>([]);
    const [pickHistory, setPickHistory] = useState<PickInfo[]>([]);
    const [pickedName, setPickedName] = useState('');

    useEffect(() => { setCanDraw(nameList.length > 0) }, [nameList]);

    const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
        var inputInt = parseInt(event.target.value);
        if (Number.isNaN(inputInt)) inputInt = 1;
        setNumPicks(inputInt);         
    };

    const handleDraw = () => {
        if (numPicks > nameList.length) {
            alert('More picks than names, please input a number smaller than number of names.');
            return;
        }

        if (numPicks < 1) {
            alert('Please input a positive number');
            return;
        }

        console.log(`drawing ${numPicks} times from ${nameList.length}`);
        console.log(`drawn names 1 ${drawnList}`);
        var pickedNum: number[] = [];
        var tempList: string[] = [];

        if (numPicks === 1) {
            var num = getRandomIntInclusive(0, nameList.length - 1);
            
            pickedNum.push(num);
            setCanDraw(false);
            
            const timerId = setInterval(() => {
                var tempNum = getRandomIntInclusive(0, nameList.length - 1);
                setPickedName(nameList[tempNum]);
            }, 100);

            const timeoutId = setTimeout(() => {
                clearInterval(timerId);
                setCanDraw(true);
                setPickedName(nameList[num]);
                tempList.push(nameList[num]);
                console.log('drawn name', nameList[num]);
                setDrawnList(tempList);
                setNameList(nameList.filter( (element) => !tempList.includes(element) ));
            }, 3000);
        }

        else {
            for (var i = 0; i < numPicks; i++) {
                var num = getRandomIntInclusive(0, nameList.length - 1);
                while (pickedNum.includes(num)) {
                    num = getRandomIntInclusive(0, nameList.length - 1);
                }

                pickedNum.push(num);
                setPickedName(nameList[num]);
                tempList.push(nameList[num]);
                console.log('drawn name', nameList[num]);
                setDrawnList(tempList);
            }

            console.log(`drawn numbers ${pickedNum}`);
            console.log(`drawn names ${drawnList}`);
            setNameList(nameList.filter( (element) => !tempList.includes(element) ));
        }

        const pickInfo: PickInfo = {
            pickOrder: pickHistory.length + 1,
            names: tempList
        }
        setPickHistory([...pickHistory, pickInfo]);
    };
    
    return (
        <div>
            <div style={{display: numPicks === 1 ? 'block' : 'none'}}><p id={styles.displayName}>{pickedName}</p></div>
            <div style={{display: numPicks === 1 ? 'none' : 'block'}}>
                <h1>Picked names</h1>
                <ul >
                    {drawnList.map(name => <li key={name}>{name}</li>)}
                </ul>
            </div>
            <input className={styles.number} type='text' onChange={handleInput} value={numPicks.toString()} pattern='^[0-9]+$'></input>
            <button onClick={handleDraw} disabled={!canDraw}>Draw</button>
            <CsvReader setList={setNameList}></CsvReader>
            <PickList nameList={nameList}></PickList>
            <PickHistory pickInfos={pickHistory}></PickHistory>
        </div>
    )
}