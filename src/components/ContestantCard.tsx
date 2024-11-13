import React from 'react';
import { Paper, Typography } from '@mui/material';

type ContestantCardProps = {
  name: string;
  photoUrl: string;
};

const ContestantCard: React.FC<ContestantCardProps> = ({ name, photoUrl }) => {
  return (
    <Paper
      elevation={3}
      style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        textAlign: 'center',
      }}
    >
      <img
        src={photoUrl}
        alt={name} // Rimosso "photo" per seguire la regola di accessibilità
        style={{
          width: '100%',
          height: 'auto',
          borderRadius: '8px',
          marginBottom: '16px',
        }}
      />
      <Typography variant="h6">{name}</Typography>
    </Paper>
  );
};

export default ContestantCard;
