import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  RotateCcw, 
  Check, 
  X, 
  RefreshCw,
  Lightbulb,
  Timer
} from 'lucide-react'

interface SudokuGameProps {
  onClose?: () => void
  isModal?: boolean
}

interface Cell {
  value: number | null
  isOriginal: boolean
  isCorrect: boolean
  isSelected: boolean
  notes: number[]
}

const SudokuGame: React.FC<SudokuGameProps> = ({ onClose, isModal = false }) => {
  const [grid, setGrid] = useState<Cell[][]>([])
  const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null)
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null)
  const [gameComplete, setGameComplete] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  // Initialize empty grid
  const initializeGrid = () => {
    const newGrid: Cell[][] = []
    for (let i = 0; i < 9; i++) {
      newGrid[i] = []
      for (let j = 0; j < 9; j++) {
        newGrid[i][j] = {
          value: null,
          isOriginal: false,
          isCorrect: true,
          isSelected: false,
          notes: []
        }
      }
    }
    return newGrid
  }

  // Generate a Sudoku puzzle
  const generatePuzzle = () => {
    const newGrid = initializeGrid()
    const puzzle = generateSudokuPuzzle(difficulty)
    
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (puzzle[i][j] !== 0) {
          newGrid[i][j] = {
            value: puzzle[i][j],
            isOriginal: true,
            isCorrect: true,
            isSelected: false,
            notes: []
          }
        }
      }
    }
    
    setGrid(newGrid)
    setGameComplete(false)
    setTimeElapsed(0)
    setIsPlaying(true)
  }

  // Simple Sudoku puzzle generator
  const generateSudokuPuzzle = (level: 'easy' | 'medium' | 'hard') => {
    const puzzle = Array(9).fill(null).map(() => Array(9).fill(0))
    const clues = level === 'easy' ? 40 : level === 'medium' ? 30 : 20
    
    // Fill diagonal 3x3 boxes first (they are independent)
    fillDiagonalBoxes(puzzle)
    
    // Fill remaining cells
    solveSudoku(puzzle)
    
    // Remove cells to create puzzle
    removeCells(puzzle, 81 - clues)
    
    return puzzle
  }

  const fillDiagonalBoxes = (grid: number[][]) => {
    for (let box = 0; box < 9; box += 3) {
      fillBox(grid, box, box)
    }
  }

  const fillBox = (grid: number[][], row: number, col: number) => {
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const randomIndex = Math.floor(Math.random() * nums.length)
        grid[row + i][col + j] = nums[randomIndex]
        nums.splice(randomIndex, 1)
      }
    }
  }

  const solveSudoku = (grid: number[][]): boolean => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValidMove(grid, row, col, num)) {
              grid[row][col] = num
              if (solveSudoku(grid)) {
                return true
              }
              grid[row][col] = 0
            }
          }
          return false
        }
      }
    }
    return true
  }

  const isValidMove = (grid: number[][], row: number, col: number, num: number): boolean => {
    // Check row
    for (let x = 0; x < 9; x++) {
      if (grid[row][x] === num) return false
    }
    
    // Check column
    for (let x = 0; x < 9; x++) {
      if (grid[x][col] === num) return false
    }
    
    // Check 3x3 box
    const startRow = row - row % 3
    const startCol = col - col % 3
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[i + startRow][j + startCol] === num) return false
      }
    }
    
    return true
  }

  const removeCells = (grid: number[][], cellsToRemove: number) => {
    let removed = 0
    while (removed < cellsToRemove) {
      const row = Math.floor(Math.random() * 9)
      const col = Math.floor(Math.random() * 9)
      if (grid[row][col] !== 0) {
        grid[row][col] = 0
        removed++
      }
    }
  }

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isPlaying && !gameComplete) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, gameComplete])

  // Check if game is complete
  useEffect(() => {
    if (grid.length === 0) return
    
    let isComplete = true
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (grid[i][j].value === null) {
          isComplete = false
          break
        }
      }
      if (!isComplete) break
    }
    
    if (isComplete) {
      setGameComplete(true)
      setIsPlaying(false)
    }
  }, [grid])

  const handleCellClick = (row: number, col: number) => {
    if (grid[row][col].isOriginal) return
    
    setSelectedCell({ row, col })
    setSelectedNumber(grid[row][col].value)
  }

  const handleNumberClick = (num: number) => {
    if (!selectedCell) return
    
    const newGrid = [...grid]
    newGrid[selectedCell.row][selectedCell.col].value = num
    newGrid[selectedCell.row][selectedCell.col].notes = []
    setGrid(newGrid)
  }

  const handleNoteClick = (num: number) => {
    if (!selectedCell) return
    
    const newGrid = [...grid]
    const cell = newGrid[selectedCell.row][selectedCell.col]
    const noteIndex = cell.notes.indexOf(num)
    
    if (noteIndex > -1) {
      cell.notes.splice(noteIndex, 1)
    } else {
      cell.notes.push(num)
    }
    
    setGrid(newGrid)
  }

  const clearCell = () => {
    if (!selectedCell) return
    
    const newGrid = [...grid]
    newGrid[selectedCell.row][selectedCell.col].value = null
    newGrid[selectedCell.row][selectedCell.col].notes = []
    setGrid(newGrid)
  }

  const getHint = () => {
    if (!selectedCell) return
    
    // Simple hint: find a valid number for the selected cell
    const { row, col } = selectedCell
    for (let num = 1; num <= 9; num++) {
      if (isValidMove(grid.map(row => row.map(cell => cell.value || 0)), row, col, num)) {
        const newGrid = [...grid]
        newGrid[row][col].value = num
        newGrid[row][col].notes = []
        setGrid(newGrid)
        setShowHint(true)
        setTimeout(() => setShowHint(false), 2000)
        break
      }
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'hard': return 'text-red-600 bg-red-100'
      default: return 'text-green-600 bg-green-100'
    }
  }

  const content = (
    <div className={`${isModal ? 'bg-white rounded-xl shadow-2xl' : 'bg-white rounded-lg shadow-lg'} p-6 max-w-4xl mx-auto`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">9</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Sudoku</h2>
            <p className="text-sm text-gray-600">Logic puzzle game</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Timer className="w-4 h-4" />
            <span>{formatTime(timeElapsed)}</span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Game Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <button
            onClick={generatePuzzle}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>New Game</span>
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={getHint}
            className="flex items-center space-x-2 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
          >
            <Lightbulb className="w-4 h-4" />
            <span>Hint</span>
          </button>
          <button
            onClick={clearCell}
            className="flex items-center space-x-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Game Completion Message */}
      <AnimatePresence>
        {gameComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg text-center"
          >
            <div className="text-green-800 font-medium mb-1">🎉 Congratulations!</div>
            <div className="text-green-700 text-sm">
              You completed the Sudoku puzzle in {formatTime(timeElapsed)}!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint Message */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg text-center"
          >
            <div className="text-yellow-800 text-sm">💡 Hint applied!</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sudoku Grid */}
        <div className="lg:col-span-2">
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="grid grid-cols-9 gap-1 max-w-md mx-auto">
              {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`
                      aspect-square border border-gray-300 flex items-center justify-center relative cursor-pointer
                      ${cell.isOriginal ? 'bg-gray-200 font-bold' : 'bg-white hover:bg-blue-50'}
                      ${selectedCell?.row === rowIndex && selectedCell?.col === colIndex ? 'ring-2 ring-blue-500' : ''}
                      ${(rowIndex + 1) % 3 === 0 ? 'border-b-2' : ''}
                      ${(colIndex + 1) % 3 === 0 ? 'border-r-2' : ''}
                    `}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  >
                    {cell.value && (
                      <span className={`text-lg ${cell.isOriginal ? 'text-gray-900' : 'text-blue-600'}`}>
                        {cell.value}
                      </span>
                    )}
                    {cell.notes.length > 0 && (
                      <div className="absolute inset-0 flex flex-wrap text-xs text-gray-500 p-1">
                        {cell.notes.map(note => (
                          <span key={note} className="w-1/3 text-center">{note}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Number Pad */}
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Number Pad</h3>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button
                  key={num}
                  onClick={() => handleNumberClick(num)}
                  className="aspect-square bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-3">Notes</h3>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button
                  key={num}
                  onClick={() => handleNoteClick(num)}
                  className="aspect-square bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">How to Play</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Fill in numbers 1-9</li>
              <li>• No duplicates in rows, columns, or 3x3 boxes</li>
              <li>• Use notes for possible numbers</li>
              <li>• Click hint for help</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        >
          {content}
        </motion.div>
      </div>
    )
  }

  return content
}

export default SudokuGame

