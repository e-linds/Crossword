import GridCreate from "./GridCreate"
import { useEffect, useInsertionEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import CreatedClue from "./CreatedClue"

function CreatePage({ user, userPuzzles, setUserPuzzles, deletePuzzle }) {
    const navigate = useNavigate()
    const [wordInput, setWordInput] = useState("")
    const [clueInput, setClueInput] = useState("")
    const [savedWords, setSavedWords] = useState({})
    const [savedClues, setSavedClues] = useState({})
    const [displayClues, setDisplayClues] = useState([])
    const [selectedCells, setSelectedCells] = useState([])
    const [orderedPositions, setOrderedPositions] = useState([])
    const [showDeletePopup, setShowDeletePopup] = useState(false)
    const [puzzleName, setPuzzleName] = useState("")
    const [puzzleNameEditMode, setPuzzleNameEditMode] = useState(false)
    const [repeatWord, setRepeatWord] = useState(false)
     

    let { puzzleid } = useParams();
    const thispuzzleid = parseInt(Object.values({ puzzleid }))

    useEffect(() => {
    
            const thispuzzle = userPuzzles.find(each => each.id === thispuzzleid)
            setSavedWords(thispuzzle ? thispuzzle.words : {})
            setPuzzleName(thispuzzle ? thispuzzle.name : "")
            setSelectedCells([])

        if (thispuzzle) {
            let dict = {}
            for (const each in thispuzzle.words) {
                const wordid = thispuzzle.words[each].id
                const clue = thispuzzle.words[each]["clue"]
                dict[wordid] = clue

                setSavedClues(dict)
            }


            }

    }, [])

    useEffect(() => {

        assignNumberedCells()

    }, [savedWords, wordInput])


    useEffect(() => {
        if (orderedPositions) {

            createDisplayClues()

    }}, [orderedPositions, savedWords, wordInput])


    function getDirection() {

        if (selectedCells.length > 1) {

            if (selectedCells[0][1] === selectedCells[1][1]) {
                return "across"
            } else if (selectedCells[0][2] === selectedCells[1][2]) {
                return "down"
            }

    }}


    function handleWordTyping(e) {
        const input = e.target.value
        setWordInput(input)
    }

    function handleClueTyping(e) {
        const input = e.target.value
        setClueInput(input)
    }
//handle submission of a new word to the board
    function handleSubmit(e) {
        e.preventDefault()
        
        if (Object.keys(savedWords).length > 0) {
            addWord()

        } else {
            addFirstWord()
        }
    e.target["new-word"].value = ""
    }

//add a word, regardless of whether this is first word or additional - defaults to puzzle id being current id
    function addWord(input = thispuzzleid) {

        if (wordInput.length > 1) {

        const new_word = {
            name: wordInput,
            clue: clueInput,
            direction: getDirection(),
            row_index: selectedCells[0][1],
            column_index: selectedCells[0][2],
            puzzle_id: input
        }

        let alreadyExists = false

        for (const each in savedWords) {
            if (savedWords[each].name === new_word.name) {
                alreadyExists = true
            }
        }

        if (alreadyExists === false) {

        fetch("/api/words", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(new_word)
        })
        .then(r => r.json())
        .then(data => {

            let array = []

            setSelectedCells(array)
            setWordInput("")
            setClueInput("")

            const row = data.row_index
            const column = data.column_index
            const clue = data.clue
            const id = data.id
            const direction = data.direction

            savedWords[savedWords.length + 1] = data

            let dict = savedClues
            dict[id] = clue
            setSavedClues(dict)

            let dict2 = orderedPositions
            dict2.push([[row + column, row, column], id, direction])
            setOrderedPositions(dict2)            

        })} else {

            setRepeatWord(true)
        }}
    }


    //add the first word, which saves the puzzle and saves the word to that new puzzle
    function addFirstWord() {

        const new_puzzle = {
            name: "New Puzzle",
            user_id: user.id
        }

        console.log(new_puzzle)

        fetch('/api/puzzles', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(new_puzzle)
        })
        .then(r => r.json())
        .then(data => {

            addWord(data.id)
            setUserPuzzles([...userPuzzles, data])
            navigate(`/create/${data.id}`)

            fetch(`/api/puzzles/${data.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: `New Puzzle No. ${data.id}`
                })
            })
            .then(r => r.json())
            .then(data => console.log("name updated"))

        })




                }


    function clearWord() {
        console.log(savedWords)

        const firstIndex = selectedCells[0]

        let wordToClear
        let keyToClear

        for (const each in savedWords) {
            const item = savedWords[each]
            const position = [(item.row_index + item.column_index), item.row_index, item.column_index]
            if (position.toString() === firstIndex.toString()) {
                wordToClear = item
                keyToClear = each
                
            }
        }
       
    
        fetch(`/api/words/${wordToClear.id}`, {
            method: "DELETE"
        })
        .then(r => {})
        .then(data => {

            let dict = savedWords

            delete dict[keyToClear]

            setSavedWords(dict)

        
        })

    
    }


    //this function creates the orderedPositions object
    function assignNumberedCells() {

        if (savedWords) {

    //this is creating a nested array in which each saved word is organized like this [[position, row, column], id, direction, ranking]
        let wordDirectionInfo = []
        for (const each in savedWords) {
            if (savedWords[each].name.length > 0) {
                const direction = savedWords[each].direction
            if (direction) {
                const id = savedWords[each].id
                const row = savedWords[each].row_index
                const column = savedWords[each].column_index
                wordDirectionInfo.push([[row + column, row, column], id, direction])
        }}}

       //sort by sum, of row + column index, which will place the display letters generally increasing from top left to bottom right 
        wordDirectionInfo.sort((x,y) =>  x[0][0] - y[0][0])

        let count = 0
        let positionsArray = []

        for (const each in wordDirectionInfo) {

            if (positionsArray.find(item => item.toString() === wordDirectionInfo[each][0].toString())) {

                const originalInstance = wordDirectionInfo.find(ele => ele[0].toString() === wordDirectionInfo[each][0].toString())
                const originalNumber = originalInstance[3]
                wordDirectionInfo[each].push(originalNumber)

            } else {

                positionsArray.push(wordDirectionInfo[each][0])
                count = count + 1
                wordDirectionInfo[each].push(count)

            }}
            console.log(wordDirectionInfo)

        setOrderedPositions(wordDirectionInfo)
        }}

function createDisplayClues() {

    let array = []
    for (const each in orderedPositions) {
        const id = orderedPositions[each][1]
        const direction = orderedPositions[each][2]
        const displayNumber = orderedPositions[each][3]
        const clueText = savedClues[id]
        const finishedClue = `${displayNumber} ${direction}: ${clueText}`
        array.push(finishedClue)  
    }
    setDisplayClues(array)
}
    
    function deleteThisPuzzle() {
        if (thispuzzleid) {
            deletePuzzle(thispuzzleid)
        }

        navigate("/home")
    }

    function handleDeleteClose() {
        setShowDeletePopup(false)
    }

    function handleRepeatWordClose() {
        setRepeatWord(false)
        setWordInput("")
        setClueInput("")
        setSelectedCells([])
    }

    function handlePuzzleEdit() {
        setPuzzleNameEditMode(true)
    }


   function handlePuzzleNameSubmit(e) {
        e.preventDefault()
        setPuzzleNameEditMode(false)

        const input = e.target.puzzlename.value

        if (input.length > 0) {

        fetch(`/api/puzzles/${thispuzzleid}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: input
            })
        })
        .then(r => r.json())
        .then(data => setPuzzleName(data.name))

    }}

    
// console.log(userPuzzles)
    // console.log(displayClues)
    // console.log(savedClues)
    // console.log(orderedPositions)
    // console.log(savedWords)



    return(
        <main id="createpage-container">
            <div> </div>
            <div id="createpuzzletitle">
            {puzzleNameEditMode ?
            <form id="puzzlenameeditmode" onSubmit={handlePuzzleNameSubmit}>
                <input name="puzzlename" placeholder={puzzleName ? puzzleName : `New Puzzle ${thispuzzleid ? `No. ${thispuzzleid}` : ""}`}></input>
                <button>✅</button>
            </form>
            :
            <h1 onDoubleClick={handlePuzzleEdit}>{puzzleName ? puzzleName : `New Puzzle ${thispuzzleid ? `No. ${thispuzzleid}` : ""}`}</h1>
            }
            </div>
            <div>
            {displayClues.length > 0 ?
            <>
            <h2>Clues</h2>
            {displayClues.map((each) => {
                return <CreatedClue key={each} text={each} savedClues={savedClues} savedWords={savedWords}/>
            })}
            </>
            :
            <h3>Clues will display here</h3>
            }
            </div>
            <div >
                <GridCreate 
                wordInput={wordInput} 
                selectedCells={selectedCells} 
                setSelectedCells={setSelectedCells} 
                savedWords={savedWords}
                orderedPositions={orderedPositions}
                />
            </div>
            <div id="create-details">
                <h2>Add to Puzzle</h2>
                    <form id="newword-form" onSubmit={handleSubmit}>
                        <input name="new-word" placeholder="new word here" onChange={handleWordTyping} value={wordInput ? wordInput : ""}></input>
                        <div>other text about other words</div>
                        <p>suggestion</p>
                        <p>suggestion</p>
                        <p>suggestion</p>
                        <textarea name="new-clue" placeholder="clue goes here" onChange={handleClueTyping} value={clueInput ? clueInput : ""}></textarea>
                        <div>text about suggested clue from AI</div>
                        <p>suggestion</p>
                        <p>suggestion</p>
                        <button type="submit">Confirm Word & Clue</button>
                        <Dialog id="repeatwordpopup" open={repeatWord} onClose={handleRepeatWordClose}>
                        <DialogContent >
                            <DialogContentText id="emojitext">🤦🏻‍♀️</DialogContentText>
                            <DialogContentText>{wordInput.toUpperCase()} is already in the puzzle. Please try another word.</DialogContentText>
                        </DialogContent>
                </Dialog>
                    </form>  
                <button onClick={clearWord}>To clear a word from the board, select all its cells, then click this button</button>
                <button id="deletepuzzle-button" onClick={() => setShowDeletePopup(true)}>{"Delete Puzzle :("}</button>
                <Dialog id="deletepopup" open={showDeletePopup} onClose={handleDeleteClose}>
                        <DialogContent >
                            <DialogContentText>Are you sure you'd like to delete? This is not reversible.</DialogContentText>
                            <Button onClick={deleteThisPuzzle}>Yes I'm sure</Button>
                            <Button onClick={handleDeleteClose}>Actually, never mind</Button>
                        </DialogContent>
                </Dialog>
            </div>
        </main>
    )
}

export default CreatePage