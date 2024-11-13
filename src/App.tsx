import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Board from './components/Board.tsx';
import Wheel from './components/Wheel.tsx';
import Keyboard from './components/Keyboard.tsx';
import ContestantsGrid from './components/ContestantsGrid.tsx';
import noUser from './assets/images/noUser.png'
import Wheel_of_Fortune_background from './assets/images/Wheel_of_Fortune_background.jpg'
import Game_Board_Background from './assets/images/Game_Board_Background.jpg'
import { Box, Button, ButtonGroup, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, Snackbar, TextField, Typography } from '@mui/material';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

import { Frase, Partecipant, SnackMessage, typeRDF, WheelItem } from './components/class/Interface.tsx';
import { backgroundAnimation, flash } from './components/class/Keyframes.tsx';

// Funzione per normalizzare una stringa rimuovendo gli accenti
const normalizeString = (str: string) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase(); // Rimuove gli accenti e converte in maiuscolo
};

const vocali = 'AEIOU'.split('');

const Countdown = 12
const Countdown_solution = 30
const NrSpicchi = 18
const ITEM_PASSA = "PASSA"
const ITEM_PERDE = "PERDE"
const ITEM_EXPRESS = "EXPR 1000"

const App = () => {
  const { transcript,
    //listening, 
    resetTranscript } = useSpeechRecognition();

  const [secretPhrase, setSecretPhrase] = useState<Frase>({ frase: "", category: "" } as Frase); // Normalizza la frase segreta
  const [guessedLetters, setGuessedLetters] = useState(Array<string>);
  const [selectedItemValue, setSelectedItemValue] = useState({ value: "-", bgcolor: "lightgrey", color: "white", action: typeRDF.none });
  const [currentLetter, setCurrentLetter] = useState("");
  const [keyboardEnabled, setKeyboardEnabled] = useState(false);
  const [allowVowels, setAllowVowels] = useState(false); // Inizializza allowVowels
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [countdown, setCountdown] = useState(Countdown);
  const [showInputSolution, setShowInputSolution] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState("");
  const [wheelSpun, setWheelSpun] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState<SnackMessage>({ open: false, message: '' } as SnackMessage)
  const [startGame, setStartGame] = useState(false)
  const [startSession, setStartSession] = useState(false)
  const [showWheel, setShowWheel] = useState(true)
  const [express, setExpress] = useState(false)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  // Carica il suono delle palette
  const audio = useMemo(() => new Audio('./assets/music/backgroundMusic.mp3'), [])


  const [frasi, setFrasi] = useState<Array<Frase>>([])

  const prendiFraseCasuale = useCallback(() => {
    if (frasi) {
      const indiceCasuale = Math.floor(Math.random() * frasi.length);
      frasi[indiceCasuale].frase = normalizeString(frasi[indiceCasuale].frase)
      return frasi[indiceCasuale];
    } else {
      return { frase: "", category: "" } as Frase
    }
  }, [frasi])

  useEffect(() => {
    // Carica il JSON dal percorso pubblico
    fetch('./assets/data/phrases.json')
      .then(response => response.json())
      .then(data => setFrasi(data))
      .catch(error => console.error('Errore nel caricamento del JSON:', error));
  }, []);


  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    setOpenSnackbar({ open: true, message: `Il tuo browser non sopporta  Speech Recognitiopn` } as SnackMessage)
  }

  const startListening = () => SpeechRecognition.startListening({ continuous: true, language: 'it-IT' });
  const stopListening = () => SpeechRecognition.stopListening();



  const [contestants, setContestants] = useState<Array<Partecipant>>([
    { name: 'Concorrente 1', src: noUser, totalPrize: 0, partialPrize: 0 } as Partecipant,
    { name: 'Concorrente 2', src: noUser, totalPrize: 0, partialPrize: 0 } as Partecipant,
    { name: 'Concorrente 3', src: noUser, totalPrize: 0, partialPrize: 0 } as Partecipant,
  ]);


  // Funzione per attivare/disattivare la musica con ALT + S
  const toggleMusic = useCallback(() => {
    if (!isMusicPlaying) {
      audio.loop = true
      audio.volume = 0.2
      audio.play()
      setIsMusicPlaying(true)
    } else {
      audio.pause()
      audio.currentTime = 0
      setIsMusicPlaying(false)
    }
  }, [isMusicPlaying, audio]);

  // Effetto per monitorare la pressione dei tasti ALT + S
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.altKey && event.key === 's') {
        toggleMusic()
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleMusic])

  //Passa al prossimo competitor
  const NextCompetitor = useCallback((message: string = "Passa al prossimo concorrente"): boolean => {
    const nextIndex: number = (activeIndex + 1) % contestants.length;
    setActiveIndex(nextIndex)
    setKeyboardEnabled(false) // Disable keyboard
    setCountdown(Countdown); // Reset countdown
    setInputValue("") // Clear input
    setWheelSpun(false) // Reset wheel spin state
    setAllowVowels(false) // Initialize allowVowels
    setShowInputSolution(false) // Hide input solution
    setExpress(false)
    setShowWheel(true)
    setOpenSnackbar({ open: true, message: message } as SnackMessage)
    return false;
  }, [activeIndex, contestants.length])


  //Perde tutto
  const handlePerde = useCallback((): boolean => {
    setContestants((prevContestants: Array<Partecipant>) => {
      const newContestants: Array<Partecipant> = [...prevContestants];
      newContestants[activeIndex].partialPrize = 0; // Azzeramento del premio parziale
      newContestants[activeIndex].totalPrize = 0;
      return newContestants;
    });
    return NextCompetitor("Hai perso tutto")
  }, [NextCompetitor, setContestants, activeIndex])

  //Passamano
  const handlePassa = useCallback((): boolean => {
    return NextCompetitor("Passa il turno");
  }, [NextCompetitor])


  const handleExpress = useCallback((): void => {
    setExpress(true)
  }, [])

  //Termina il gioco
  const handleAddImportOnFinishGame = useCallback(() => {
    //Incremente l'importo totale solo del giocatore che ha vinto
    setContestants((prevContestants) => {
      const newContestants = [...prevContestants];
      newContestants[activeIndex].totalPrize = newContestants[activeIndex].totalPrize + newContestants[activeIndex].partialPrize
      return newContestants;
    })
    //Azzera i parziali di tutti i giocatore
    setContestants((prevContestants) => {
      return prevContestants.map((contestant) => ({
        ...contestant,
        partialPrize: 0,
      }))
    })
    setKeyboardEnabled(false); // Disabilita la tastiera
    setCountdown(Countdown); // Resetta il countdown per il nuovo turno
    setInputValue(''); // Resetta il valore dell'input alla fine del turno
    setWheelSpun(false);
    setAllowVowels(false); // Inizializza allowVowels
    setInputValue("")
    setShowInputSolution(false)
    setOpenSnackbar({ open: true, message: "Hai vinto" } as SnackMessage)
    setStartGame(false)
    setExpress(false)
    setSecretPhrase({ frase: "", category: "" })
    setStartSession(false)
  }, [activeIndex, setContestants])

  // useMemo per creare gli items, ora senza dipendenze
  const items: Array<WheelItem> = useMemo(() => {
    const baseItems = [
      { value: "100", bgcolor: 'red', color: 'white', nrRepeat: 3, action: typeRDF.none },
      { value: "150", bgcolor: 'blue', color: 'white', nrRepeat: 2, action: typeRDF.none },
      { value: "200", bgcolor: 'green', color: 'white', nrRepeat: 2, action: typeRDF.none },
      { value: "250", bgcolor: 'purple', color: 'white', nrRepeat: 2, action: typeRDF.none },
      { value: "1000", bgcolor: 'gold', color: 'black', nrRepeat: 1, action: typeRDF.none },
      { value: "5000", bgcolor: 'orange', color: 'black', nrRepeat: 1, action: typeRDF.none },
      { value: ITEM_EXPRESS, bgcolor: 'yellow', color: 'white', nrRepeat: 1, action: typeRDF.express },
      { value: ITEM_PASSA, bgcolor: 'white', color: 'white', nrRepeat: 2, action: typeRDF.passa },
      { value: ITEM_PERDE, bgcolor: 'black', color: 'white', nrRepeat: 1, action: typeRDF.perde }
    ];

    const createItems: Array<WheelItem> = [];
    baseItems.forEach(item => {
      for (let i = 0; i < item.nrRepeat; i++) {
        createItems.push({ ...item as WheelItem });
      }
    });

    while (createItems.length < NrSpicchi) {
      baseItems.forEach(item => {
        if (createItems.length < NrSpicchi) {
          createItems.push({ ...item as WheelItem });
        }
      });
    }

    // Shuffle items on each change
    return createItems.sort(() => Math.random() - 0.5);
  }, []); // Aggiungi queste funzioni alle dipendenze




  const handleVowelRequest = () => {
    // Logica per gestire la richiesta delle vocali
    const currentContestant = contestants[activeIndex];
    if (currentContestant.partialPrize >= 200) {
      setAllowVowels(true); // Abilita le vocali quando viene richiesto
      setCountdown(Countdown)
    } else {
      NextCompetitor("Credito non disponibile")
    }
  }

  const handleStartGame = useCallback(() => {
    setActiveIndex(0)
    setGuessedLetters([])
    setStartGame(true)
    setStartSession(true)
    setShowWheel(true)
    setCountdown(Countdown) // Inizia il timer di countdown
    setSecretPhrase(prendiFraseCasuale()) // Imposta una nuova frase
    startListening()
    toggleMusic()
  }, [prendiFraseCasuale, toggleMusic])

  const handleSelectValue = (value: number, occurrences: number = 0) => {
    if (!isNaN(value)) {
      setContestants((prevContestants) => {
        const newContestants = [...prevContestants];
        newContestants[activeIndex].partialPrize = newContestants[activeIndex].partialPrize + (value * occurrences); // Aggiungi il premio parziale
        return newContestants;
      })
    }
  }

  const onLetterSelect = (letter: string) => {
    const letterUpper: string = normalizeString(letter) // Normalizza la lettera selezionata
    const currentContestant = contestants[activeIndex]
    setOpenSnackbar({ open: true, message: `Hai premuto la lettera: ${letterUpper}` } as SnackMessage)

    // Se la lettera è una vocale, scalare il premio parziale
    if (vocali.includes(letterUpper)) {
      if (currentContestant.partialPrize >= 200) {
        setContestants((prevContestants) => {
          const newContestants = [...prevContestants];
          newContestants[activeIndex].partialPrize -= 200; // Scala il premio
          return newContestants;
        });

        setWheelSpun(false);
        setAllowVowels(false); // Inizializza allowVowels
        setShowWheel(true)
      } else {
        // Passa al concorrente successivo
        return NextCompetitor()
      }
    }

    // Controlla se la lettera è già stata indovinata
    if (guessedLetters.includes(letterUpper)) {
      NextCompetitor()
      return
    }

    // Aggiungi la lettera indovinata
    setGuessedLetters([...guessedLetters, letterUpper]);
    !express && setKeyboardEnabled(false); // Disabilita la tastiera se express rimane attiva
    setCurrentLetter(letterUpper); // Imposta la lettera corrente
    setCountdown(Countdown); // Resetta il countdown

    // Controlla se la lettera è presente nella frase segreta
    if (normalizeString(secretPhrase.frase).includes(letterUpper)) {
      // Se la lettera è corretta, gestisci il valore selezionato
      const occurrences = normalizeString(secretPhrase.frase).toLowerCase().split(letterUpper.toLowerCase()).length - 1;
      //Se è una vocale non deve sommare il montepremi della ruota
      !vocali.includes(letterUpper) && handleSelectValue(parseFloat(selectedItemValue.value) || 0, occurrences)
      setShowWheel(true)
    } else {
      return NextCompetitor(`La lettera ${letterUpper} non è persente`)
    }

    // Resetta la lettera corrente dopo 1 secondo (per la gestione dell'evidenziazione temporanea)
    setTimeout(() => {
      setCurrentLetter("");
    }, 1000);
  }

  const handleSpinEnd = (item: WheelItem) => {
    // Riattiva la tastiera al termine della rotazione e riavvia il timer
    switch (item.action) {
      case typeRDF.perde: handlePerde()
        return
      case typeRDF.passa: handlePassa()
        return
      case typeRDF.express: item.value.replace(ITEM_EXPRESS, "")
        handleExpress()
    }
    setSelectedItemValue(item)
    setShowWheel(false)
    setStartSession(true)
    setKeyboardEnabled(true)
    setCountdown(Countdown) // Inizia il countdown quando la tastiera è abilitata
  };

  useEffect(() => {
    let timer;
    if ((startSession && countdown > 0) || (keyboardEnabled && countdown > 0)) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      // Passa al concorrente successivo se il timer scade
      NextCompetitor()
    }

    return () => clearInterval(timer);
  }, [keyboardEnabled, startSession, countdown, activeIndex, NextCompetitor])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  }

  const normalizeAccents = (str) => {
    // Sostituzione delle lettere con accenti acuti con accenti gravi
    return str
      .replace(/[èéêë]/g, 'e´')
      .replace(/[àáâä]/g, 'a´')
      .replace(/[ìíîï]/g, 'i´')
      .replace(/[òóôö]/g, 'o´')
      .replace(/[ùúûü]/g, 'u´');
  };

  const checkSolution = () => {
    // Normalizza sia l'input dell'utente che la frase segreta
    const normalizedInput = normalizeAccents(inputValue.toLocaleLowerCase());
    const normalizedPhrase = normalizeAccents(secretPhrase.frase.toLocaleLowerCase());

    if (normalizedInput === normalizedPhrase) {
      handleCloseDialog()
      handleAddImportOnFinishGame()
    } else {
      handleCloseDialog()
      return NextCompetitor("Risposta errata")
    }
  };


  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      checkSolution()
    }
  }

  // Funzione per chiudere la Snackbar
  const handleCloseSnackbar = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') return;
    setOpenSnackbar({ open: false, message: "" } as SnackMessage);
  };



  useEffect(() => {
    // Avvia automaticamente l'ascolto dello speech all'avvio del componente
    startListening()

    const checkTranscriptForStartCommand = () => {
      if (transcript.toLowerCase().includes("gioca")) {
        handleStartGame()
        resetTranscript() // Pulisce il transcript dopo aver rilevato il comando
        stopListening() // Opzionale: interrompe l'ascolto dopo aver rilevato "gioca"
      }
    }

    // Controlla periodicamente il transcript per il comando "gioca"
    const interval = setInterval(checkTranscriptForStartCommand, 1000);

    return () => clearInterval(interval);
  }, [transcript, handleStartGame, resetTranscript]);

  // Function to close the dialog
  const handleCloseDialog = () => {
    setShowInputSolution(false)
  }


  return <>
    <Grid container sx={{
      height: "100vh",
      position: "relative",
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.8)), url(${Wheel_of_Fortune_background})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      //animation: `${backgroundAnimation} 5s ease-in-out infinite`, 
      padding: 0.5
    }}>
      {/* Prima riga: Board e Wheel */}
      <Grid item xs={8} md={8} sm={8} textAlign={"center"} sx={{
        position: "relative",
        backgroundImage: `url(${Game_Board_Background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        border: "5px solid", // Bordi con spessore di 5px
        borderImage: "linear-gradient(to right, white, black) 1", // Bordi bianchi e neri
        animation: startGame ? `${backgroundAnimation} 5s ease-in-out infinite` :``,
      }}>
        <Typography
          variant={"h3"}
          width={"100%"}
          sx={{
            fontStyle: 'italic',
            color: 'white',  // Colore del testo bianco
            textShadow: `
      1px 1px 0px black,  // Bordo nero sottile attorno al testo
      -1px -1px 0px black,
      1px -1px 0px black,
      -1px 1px 0px black,
      0px 0px 15px rgba(0, 0, 0, 0.5)`  // Effetto 3D del testo
          }}
        >
          Categoria: {secretPhrase.category}
        </Typography>


        <Board
          secretPhrase={secretPhrase.frase}
          guessedLetters={guessedLetters}
          currentLetter={currentLetter}
        />
      </Grid>

      <Grid item xs={4} md={4} sm={4}>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center', // Centra orizzontalmente
            alignItems: 'center', // Centra verticalmente
            width: '100%',
          }}
        >
          <ButtonGroup variant={"contained"} sx={{ width: '100%' }} disabled={startGame}>
            <Button fullWidth onClick={() => window.location.reload()}>
              Aggiorna
            </Button>
            <Button fullWidth onClick={handleStartGame}>
              Gioca
            </Button>
          </ButtonGroup>
        </Box>
        {<Wheel disable={!(showWheel && startGame)} items={items} onSpinEnd={handleSpinEnd} onStartSession={setStartSession} />}
        <Divider />
        <Typography margin={1} variant="h3" bgcolor={selectedItemValue.bgcolor} color={selectedItemValue.color} textAlign={"center"} borderRadius={2}>
          {selectedItemValue.value.toUpperCase()}
        </Typography>
        <Box padding={1}>
          <Typography
            variant={"h4"}
            width={"100%"}
            textAlign={"center"}
            sx={{
              background: (countdown === 0 || countdown > 3) ? "green" : "red",
              fontStyle: 'italic',
              color: 'white',  // Colore del testo bianco
              borderRadius: 2,
              textShadow: `
      1px 1px 0px black,  // Bordo nero sottile attorno al testo
      -1px -1px 0px black,
      1px -1px 0px black,
      -1px 1px 0px black,
      0px 0px 15px rgba(0, 0, 0, 0.5)`,  // Effetto 3D del testo
              animation: countdown > 0 && countdown < 3 ? `${flash} 1s infinite` : 'none',
            }}
          >Tempo rimasto: {countdown}</Typography>
        </Box>
      </Grid>

      {/* Seconda riga: Keyboard e Countdown */}
      <Grid item xs={12} md={12} sm={12} paddingTop={1}>
        <Keyboard
          onLetterSelect={onLetterSelect}
          guessedLetters={guessedLetters}
          disabled={!keyboardEnabled}
          allowVowels={allowVowels} // Passa allowVowels al componente
          onVowelRequest={handleVowelRequest}
          canRequestVowels={!wheelSpun} // Passa la logica per abilitare/disabilitare la richiesta delle vocali
          onSolution={() => {
            setCountdown(Countdown_solution)
            setShowInputSolution(true)
          }}
        />
      </Grid>

      {/* Terza riga: Concorrenti */}
      <Grid item xs={12} md={12} sm={12}>
        <ContestantsGrid contestants={contestants} activeIndex={activeIndex} setContestants={setContestants} />
      </Grid>
    </Grid>

    {showInputSolution && <Dialog open={showInputSolution} onClose={handleCloseDialog} fullWidth>
      <DialogTitle>Inserisci la Soluzione</DialogTitle>
      <DialogContent>
        <TextField
          inputProps={{
            style: { textAlign: 'center', fontSize: "20px" },
          }}
          id="solution"
          label="Soluzione"
          variant="standard"
          fullWidth
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog}>Annulla</Button>
        <Button onClick={() => checkSolution()}>Invia</Button>
      </DialogActions>
    </Dialog>}

    <Snackbar
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      open={openSnackbar.open}
      autoHideDuration={5000} // Chiude automaticamente dopo 3 secondi
      onClose={handleCloseSnackbar}
      message={openSnackbar.message}
    />
  </>
}

export default App
