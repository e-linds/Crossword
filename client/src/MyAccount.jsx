import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Button from '@mui/material/Button';


function MyAccount({ user, setUser, userPuzzles, setCurrentTab }) {
    const location = useLocation()
    const [longestWord, setLongestWord] = useState("")
    const [mostUsedLetter, setMostUsedLetter] = useState("")
    const [editProfile, setEditProfile] = useState(false)


    useEffect(() => {
        findWordRecords()
        setCurrentTab(location.pathname)

    }, [])


    function handleClick() {

        fetch("/api/logout", {
          method: "DELETE"
      })
      .then(r => setUser(null)
      ) }



    function editProfileForm(e) {
        e.preventDefault()

        setEditProfile(false)

        const newname = e.target["name"].value 
        const newemail = e.target["email"].value 



        if (newname) {

            fetch(`/api/user/${user.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: newname
                })

        })

        user.name = newname
    
    }
    //WORKING ON VALIDATION OF EMAIL FOR FRONTEND


        if (newemail.includes("@")) {

            fetch(`/api/user/${user.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: newemail
                })

        })

        user.email = newemail
    
    } else {
        window.alert("Email must contain @ symbol")
        setEditProfile(true)
    }

    }



      //there is certainly a more efficient way to do this - current time complexity is n squared
    function findWordRecords() {
        let wordarray = []
        for (const each in userPuzzles) {
            wordarray.push(userPuzzles[each].words)
        }
        let wordnamearray = []
        for (const each in wordarray) {
            for (const item in wordarray[each]) {
                wordnamearray.push(wordarray[each][item].name)
            }
        }
        let count = 1
        for (const each in wordnamearray) {
            if (wordnamearray[each].length > count) {
                count = wordnamearray[each].length
                setLongestWord(wordnamearray[each])
            }
        }
        let all_letters = []
        for (const each in wordnamearray) {
            for (const item in wordnamearray[each]) {
                all_letters.push(wordnamearray[each][item])
            }
     
        }
        let letterdict = {}
        for (const each in all_letters) {
            const existingCount = letterdict[all_letters[each]]
            letterdict[all_letters[each]] = existingCount ? existingCount + 1 : 1

        }
        const all_letter_counts = Object.values(letterdict)
        let count2 = 0
        let highestcount = ""
        for (const each in all_letter_counts) {
            if (all_letter_counts[each] > count2) {
                count2 = all_letter_counts[each]
                highestcount = count2
            }
            const highestcountletter = Object.keys(letterdict).find(each => letterdict[each] === highestcount)
            setMostUsedLetter(highestcountletter)
        }
    }

    
      

    return(
        <>
        <div>
            <h3>{user.name}</h3>
            <p>{user.email}</p>
        </div>
        <button onClick={() => setEditProfile(true)}>Edit Profile</button>
        <Dialog open={editProfile}>
                            <DialogContent >
                                <form onSubmit={editProfileForm}>
                                    <label>New Name:</label>
                                    <input name="name"></input>
                                    <label>New Email:</label>
                                    <input name="email"></input>
                                    <button type="submit">Submit</button>
                                    <button onClick={() => setEditProfile(false)}>Never mind</button>
                                </form>
                            </DialogContent>
                    </Dialog>
        <button onClick={handleClick}>Logout</button>
        <div>
            <h3>Records</h3>
            <p>Number of puzzles built: {userPuzzles.length}</p>
            <p>Longest Word: {longestWord.toUpperCase()}, {longestWord.length} letters</p>
            <p>Most-Used Letter: {mostUsedLetter.toUpperCase()}</p>
        </div>
        </>
    )
}

export default MyAccount