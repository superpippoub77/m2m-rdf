import React, { useState, useEffect, useCallback } from 'react';
import { Button, ButtonGroup, Grid } from '@mui/material';

interface KeyboardProps {
  onLetterSelect: (letter: string) => void;
  guessedLetters: string[];
  disabled: boolean;
  allowVowels: boolean;
  onVowelRequest: () => void;
  canRequestVowels: boolean;
  onSolution: () => void;
}

const Keyboard: React.FC<KeyboardProps> = ({
  onLetterSelect,
  guessedLetters,
  disabled,
  allowVowels,
  onVowelRequest,
  canRequestVowels,
  onSolution,
}) => {
  const [showSolutionButton, setShowSolutionButton] = useState<boolean>(true);
  const vowels = 'AEIOU'.split('')
  const consonants = 'BCDFGHJKLMNPQRSTVWXYZ'.split('')

  const handleSolution = useCallback(() => {
    setShowSolutionButton(false);
    onSolution();
  },[onSolution])

  // Aggiunge un listener per i tasti della tastiera
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();

      if (consonants.includes(key) || (allowVowels && vowels.includes(key))) {
        // Se è una lettera valida e non è già stata indovinata
        if (!guessedLetters.includes(key) && !disabled) {
          onLetterSelect(key);
        }
      }

      // Tasto per richiedere le vocali (es. 'V' per "vocale")
      if (key === 'V' && canRequestVowels && !allowVowels) {
        onVowelRequest();
      }

      // Tasto per dare la soluzione (es. 'S' per "soluzione")
      if (key === 'S' && showSolutionButton) {
        handleSolution();
      }
    };

    // Aggiunge il listener al montaggio del componente
    window.addEventListener('keydown', handleKeyDown);

    // Rimuove il listener quando il componente viene smontato
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [allowVowels, canRequestVowels, disabled, guessedLetters, showSolutionButton, consonants, handleSolution, onLetterSelect, onVowelRequest, vowels]);

  return (
    <Grid container spacing={1} textAlign={"center"}>
      <Grid item md={12} padding={1}>
        {/* Tasti delle consonanti */}
        <ButtonGroup variant="contained" size="small" fullWidth>
          {consonants.map((letter) => (
            <Button
              key={letter}
              onClick={() => onLetterSelect(letter)}
              disabled={disabled || guessedLetters.includes(letter)}
            >
              {letter}
            </Button>
          ))}
          {allowVowels &&
            vowels.map((letter) => (
              <Button
                key={letter}
                onClick={() => onLetterSelect(letter)}
                disabled={guessedLetters.includes(letter)}
              >
                {letter}
              </Button>
            ))}
        </ButtonGroup>
      </Grid>
      <Grid item md={12} padding={1}>
        <ButtonGroup variant={"outlined"} size="small" color={"warning"} fullWidth>
          {/* Bottone per abilitare le vocali */}
          {!allowVowels && (
            <Button onClick={onVowelRequest}>
              Richiedi vocale (200)
            </Button>
          )}
          {/* Bottone "Do la soluzione" */}
          <Button onClick={handleSolution}>
            Do la soluzione
          </Button>
        </ButtonGroup>
      </Grid>
    </Grid>
  )
}

export default Keyboard;
