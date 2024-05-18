import { useEffect, useState } from "react";
import './App.css';
import axios from 'axios';

function App() {
    const CLIENT_ID = "a0a576c09d3540ec988770b2133f5e67"
    const REDIRECT_URI = "http://localhost:3000"
    const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
    const RESPONSE_TYPE = "token"
    const SCOPE = "playlist-read-private"

    const [token, setToken] = useState("")
    const [playlists, setPlaylists] = useState([])

    useEffect(() => {
        const hash = window.location.hash
        let token = window.localStorage.getItem("token")

        if (!token && hash) {
            token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]

            window.location.hash = ""
            window.localStorage.setItem("token", token)
        }

        setToken(token)

    }, [])

    const logout = () => {
        setToken("")
        window.localStorage.removeItem("token")
    }

    const getPlaylists = async () => {
        try {
            const { data } = await axios.get("https://api.spotify.com/v1/me/playlists", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            setPlaylists(data.items)
        } catch (error) {
            console.error("Error fetching playlists:", error)
        }
    }

    useEffect(() => {
        if (token) {
            getPlaylists()
        }
    }, [token])

    const renderPlaylists = () => {
        return playlists.map(playlist => (
            <div key={playlist.id} className="playlist-item">
                {playlist.images.length > 0 ?
                    <a href={playlist.external_urls.spotify} target="_blank" rel="noopener noreferrer">
                        <img src={playlist.images[0].url} alt={playlist.name} />
                    </a>
                    : <div>No Image</div>
                }
                <h3>{playlist.name}</h3>
            </div>
        ));
    };


    return (
        <div className="App">
            <header className="App-header">
                <h1>My Spotify Playlists</h1>
                {!token ?
                    <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`}>Login to Spotify</a>
                    : <button onClick={logout}>Logout</button>}

                <div className="playlists-container">
                    {token && playlists.length === 0 && <p>Loading...</p>}
                    {token && playlists.length > 0 && renderPlaylists()}
                </div>
            </header>
        </div>
    );
}

export default App;
