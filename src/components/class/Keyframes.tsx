import { keyframes } from '@mui/system';

export const flash = keyframes`
  0% {
    background-color: red;
  }
  50% {
    background-color: transparent;
  }
  100% {
    background-color: red;
  }
`;

export const backgroundAnimation = keyframes`
0% {
  background-size: 100%;
}
50% {
  background-size: 105%; /* Ingrandimento dell'immagine */
}
100% {
  background-size: 100%; /* Torna alla dimensione originale */
}
`;