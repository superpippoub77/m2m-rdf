import { Avatar, Grid, Paper, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';

// Tipi per le proprietà del singolo concorrente
interface ContestantProps {
  name: string;
  src: string;
  totalPrize: number;
  partialPrize: number;
  isActive: boolean;
  onNameChange: (newName: string) => void;
}

// Componente per un singolo concorrente
const Contestant: React.FC<ContestantProps> = ({ name, src, totalPrize, partialPrize, isActive, onNameChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(name); // Stato per il nome editabile

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedName(e.target.value); // Aggiorna il valore del nome
  };

  const handleBlur = () => {
    setIsEditing(false); // Esci dalla modalità di modifica
    onNameChange(editedName); // Chiama la funzione per aggiornare il nome
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur(); // Salva il valore e esci dalla modalità di modifica
    }
  };

  return (
    <Paper style={{ ...styles.contestant, backgroundColor: isActive ? '#ffe135' : '#fff' }}>
      <Grid container justifyContent={"center"} textAlign={"center"}>
        <Grid item padding={1}>
          <Avatar alt={name} src={src} />
        </Grid>
        <Grid item padding={1}>
          {isEditing ? (
            <TextField
              value={editedName}
              onChange={handleNameChange}
              onBlur={handleBlur} // Chiama handleBlur quando l'input perde il focus
              onKeyDown={handleKeyDown} // Chiama handleBlur quando si preme "Enter"
              autoFocus // Aggiunge il focus automatico quando entra in modalità di modifica
            />
          ) : (
            <Typography variant="h6" onClick={() => setIsEditing(true)}>
              {name}
            </Typography> // Clicca per entrare in modalità di modifica
          )}
        </Grid>
      </Grid>
      <Typography>
        Montepremi Totale: <span style={styles.ledNumber}>€{totalPrize}</span>
      </Typography>
      <Typography>
        Montepremi Parziale: <span style={styles.ledNumber}>€{partialPrize}</span>
      </Typography>
    </Paper>
  );
};


interface ContestantsGridProps {
  contestants: any
  activeIndex: number
  setContestants: any
}

// Componente principale
const ContestantsGrid: React.FC<ContestantsGridProps> = ({ contestants, activeIndex, setContestants }) => {
  const handleNameChange = (index: number, newName: string) => {
    const updatedContestants = contestants.map((contestant, i) =>
      i === index ? { ...contestant, name: newName } : contestant
    );
    setContestants(updatedContestants); // Aggiorna lo stato dei concorrenti
  };

  return (
    <div style={styles.grid}>
      {contestants.map((contestant, index) => (
        <Contestant
          key={index}
          name={contestant.name}
          src={contestant.src}
          totalPrize={contestant.totalPrize}
          partialPrize={contestant.partialPrize}
          isActive={index === activeIndex}
          onNameChange={(newName) => handleNameChange(index, newName)} // Passa la funzione per cambiare il nome
        />
      ))}
    </div>
  );
};

// Stili
const styles = {
  grid: {
    display: 'flex',
    justifyContent: 'space-around',
    flexWrap: "wrap" as const,
    padding: '5px',
  },
  contestant: {
    border: '1px solid #ccc',
    borderRadius: '5px',
    padding: '1px',
    margin: '1px',
    textAlign: 'center' as const,
    width: "30%",
  },
  // Nuovo stile per i numeri con font in stile LED
  ledNumber: {
    fontFamily: 'Digital, monospace',
    fontSize: '24px',
    color: '#ff0000',
  },
};

export default ContestantsGrid;
