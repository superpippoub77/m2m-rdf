import React, { useState, useMemo } from 'react';
import './css/Board.css';
import { Zoom } from '@mui/material';

const distributeWords = (secretPhrase: string, gridStructure: number[]): string[] => {
  const words = secretPhrase.split(' ');
  const rows: string[] = [];
  let currentRow: string = '';
  let currentIndex = 0;

  words.forEach((word) => {
    const maxCells = gridStructure[currentIndex];
    if (currentRow.length + word.length + (currentRow.length > 0 ? 1 : 0) <= maxCells) {
      currentRow = currentRow ? `${currentRow} ${word}` : word;
    } else {
      rows.push(currentRow);
      currentRow = word;
      currentIndex++;
    }

    if (currentIndex >= gridStructure.length) return;
  });

  if (currentRow) rows.push(currentRow);
  while (rows.length < gridStructure.length) rows.push('');

  return rows;
};

interface BoardProps {
  secretPhrase: string;
  guessedLetters: string[];
  currentLetter: string;
}

const Board: React.FC<BoardProps> = ({ secretPhrase, guessedLetters, currentLetter }) => {
  const gridStructure = useMemo(() => [12, 14, 14, 12], []);
  const [revealedLetters] = useState<{ rowIndex: number; letterIndex: number }[]>([]);

  const distributedRows = useMemo(() => distributeWords(secretPhrase, gridStructure), [secretPhrase, gridStructure]);

  const renderBlock = (letter: string, rowIndex: number, letterIndex: number) => {
    const isRevealed = revealedLetters.some(index => index.rowIndex === rowIndex && index.letterIndex === letterIndex);
    const isGuessed = guessedLetters.includes(letter.toUpperCase());
    const isSpecialCharacter = !/[a-zA-Z]/.test(letter); // Verifica se è un carattere speciale o punteggiatura
    const backgroundColor = (letter !== " " && letter !== "") ? 'white' : '#999';
  
    return (
      <div key={letterIndex} className="board-block" style={{ backgroundColor }}>
        {isGuessed || isRevealed || isSpecialCharacter || (letter === ' ') ? <Zoom in={true}><div>{letter}</div></Zoom> : ''}
      </div>
    );
  };


  return (
    <div className="board">
      {distributedRows.map((row, rowIndex) => (
        <div key={rowIndex} className="board-row" style={{ gridTemplateColumns: `repeat(${gridStructure[rowIndex]}, 1fr)` }}>
          {row.split('').map((letter, letterIndex) => renderBlock(letter, rowIndex, letterIndex))}
          {row.length < gridStructure[rowIndex] && Array(gridStructure[rowIndex] - row.length).fill(null).map((_, letterIndex) => renderBlock('', rowIndex, letterIndex))}
        </div>
      ))}
    </div>
  );
};

export default Board;
