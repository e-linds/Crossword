import { useEffect, useState } from 'react'
import GridCell from "./GridCell"

function Grid2 ({ wordInput }) {
    const [selectedCells, setSelectedCells] = useState([])

    const array = ["a", "b", "c", "d", "e", "f", "g", "h", "i", 'j', 'k', "l", "m", "n", "o", "p", "q", "r", "s"]
    let row_index
    let column_index

    // console.log(wordInput)

    return(
        <div id="grid2">
            {array.map((each) => {
                row_index = array.indexOf(each)
                return <div id="gridrows">
                    {array.map((item) => {
                        column_index = array.indexOf(item)
                        return <GridCell 
                        row_index={row_index} 
                        column_index={column_index} 
                        selectedCells={selectedCells} 
                        setSelectedCells={setSelectedCells}
                        wordInput={wordInput}/>
                    })}
                    
                </div>
            })}
        </div>
    )
}

export default Grid2