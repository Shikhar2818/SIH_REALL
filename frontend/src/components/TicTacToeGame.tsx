import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  RotateCcw, 
  X, 
  RefreshCw,
  Bot,
  User,
  Trophy,
  Target
} from 'lucide-react'

interface TicTacToeGameProps {
  onClose?: () => void
  isModal?: boolean
}

type Player = 'X' | 'O' | null
type GameStatus = 'playing' | 'X' | 'O' | 'draw'

const TicTacToeGame: React.FC<TicTacToeGameProps> = ({ onClose, isModal = false }) => {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null))
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X')
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing')
  const [score, setScore] = useState({ X: 0, O: 0, draws: 0 })
  const [gameMode, setGameMode] = useState<'vs-human' | 'vs-ai'>('vs-ai')
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'hard'>('easy')
  const [isAiThinking, setIsAiThinking] = useState(false)

  // Check for winner
  const checkWinner = (squares: Player[]): Player => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ]

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i]
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a]
      }
    }
    return null
  }

  // Check if board is full
  const isBoardFull = (squares: Player[]): boolean => {
    return squares.every(square => square !== null)
  }

  // AI move logic
  const getAiMove = (squares: Player[]): number => {
    if (aiDifficulty === 'easy') {
      // Easy AI: random move
      const emptySquares = squares.map((square, index) => square === null ? index : null).filter(val => val !== null)
      return emptySquares[Math.floor(Math.random() * emptySquares.length)] as number
    } else {
      // Hard AI: minimax algorithm
      return minimax(squares, 'O').index
    }
  }

  // Minimax algorithm for hard AI
  const minimax = (squares: Player[], player: Player): { score: number, index: number } => {
    const winner = checkWinner(squares)
    
    if (winner === 'O') return { score: 1, index: -1 }
    if (winner === 'X') return { score: -1, index: -1 }
    if (isBoardFull(squares)) return { score: 0, index: -1 }

    const moves: { score: number, index: number }[] = []
    
    for (let i = 0; i < squares.length; i++) {
      if (squares[i] === null) {
        const newSquares = [...squares]
        newSquares[i] = player
        const result = minimax(newSquares, player === 'X' ? 'O' : 'X')
        moves.push({ score: result.score, index: i })
      }
    }

    if (player === 'O') {
      return moves.reduce((best, move) => move.score > best.score ? move : best)
    } else {
      return moves.reduce((best, move) => move.score < best.score ? move : best)
    }
  }

  // Handle cell click
  const handleCellClick = (index: number) => {
    if (board[index] || gameStatus !== 'playing') return
    
    const newBoard = [...board]
    newBoard[index] = currentPlayer
    setBoard(newBoard)
    
    const winner = checkWinner(newBoard)
    if (winner) {
      setGameStatus(winner)
      setScore(prev => ({ ...prev, [winner]: prev[winner] + 1 }))
    } else if (isBoardFull(newBoard)) {
      setGameStatus('draw')
      setScore(prev => ({ ...prev, draws: prev.draws + 1 }))
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X')
    }
  }

  // AI move effect
  useEffect(() => {
    if (gameMode === 'vs-ai' && currentPlayer === 'O' && gameStatus === 'playing') {
      setIsAiThinking(true)
      const timer = setTimeout(() => {
        const aiMove = getAiMove(board)
        if (aiMove !== -1) {
          handleCellClick(aiMove)
        }
        setIsAiThinking(false)
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [currentPlayer, gameStatus, board, gameMode])

  // Reset game
  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setCurrentPlayer('X')
    setGameStatus('playing')
    setIsAiThinking(false)
  }

  // Reset score
  const resetScore = () => {
    setScore({ X: 0, O: 0, draws: 0 })
  }

  const getStatusMessage = () => {
    if (gameStatus === 'playing') {
      if (isAiThinking) return 'AI is thinking...'
      return `Player ${currentPlayer}'s turn`
    }
    if (gameStatus === 'draw') return "It's a draw!"
    return `Player ${gameStatus} wins!`
  }

  const getStatusColor = () => {
    if (gameStatus === 'playing') return 'text-blue-600'
    if (gameStatus === 'draw') return 'text-gray-600'
    return 'text-green-600'
  }

  const content = (
    <div className={`${isModal ? 'bg-white rounded-xl shadow-2xl' : 'bg-white rounded-lg shadow-lg'} p-6 max-w-2xl mx-auto`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-700 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Tic Tac Toe</h2>
            <p className="text-sm text-gray-600">Classic strategy game</p>
          </div>
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

      {/* Game Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <select
            value={gameMode}
            onChange={(e) => {
              setGameMode(e.target.value as 'vs-human' | 'vs-ai')
              resetGame()
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="vs-human">vs Human</option>
            <option value="vs-ai">vs AI</option>
          </select>
          {gameMode === 'vs-ai' && (
            <select
              value={aiDifficulty}
              onChange={(e) => {
                setAiDifficulty(e.target.value as 'easy' | 'hard')
                resetGame()
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="easy">Easy AI</option>
              <option value="hard">Hard AI</option>
            </select>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={resetGame}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>New Game</span>
          </button>
          <button
            onClick={resetScore}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Score</span>
          </button>
        </div>
      </div>

      {/* Game Status */}
      <div className="text-center mb-6">
        <div className={`text-lg font-medium ${getStatusColor()}`}>
          {getStatusMessage()}
        </div>
        {isAiThinking && (
          <div className="flex items-center justify-center space-x-2 mt-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
            <span className="text-sm text-gray-600">AI is thinking...</span>
          </div>
        )}
      </div>

      {/* Score Board */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <User className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">Player X</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{score.X}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Trophy className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">Draws</span>
          </div>
          <div className="text-2xl font-bold text-gray-600">{score.draws}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            {gameMode === 'vs-ai' ? <Bot className="w-5 h-5 text-green-600" /> : <User className="w-5 h-5 text-green-600" />}
            <span className="font-medium text-green-900">Player O</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{score.O}</div>
        </div>
      </div>

      {/* Game Board */}
      <div className="bg-gray-100 p-6 rounded-lg">
        <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto">
          {board.map((cell, index) => (
            <motion.button
              key={index}
              onClick={() => handleCellClick(index)}
              disabled={cell !== null || gameStatus !== 'playing' || isAiThinking}
              className={`
                aspect-square bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center text-4xl font-bold
                ${cell === 'X' ? 'text-blue-600' : cell === 'O' ? 'text-green-600' : 'text-gray-400'}
                ${cell === null && gameStatus === 'playing' && !isAiThinking ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-not-allowed'}
                ${(index + 1) % 3 === 0 ? 'border-r-0' : ''}
                ${Math.floor(index / 3) === 2 ? 'border-b-0' : ''}
              `}
              whileHover={{ scale: cell === null && gameStatus === 'playing' && !isAiThinking ? 1.05 : 1 }}
              whileTap={{ scale: cell === null && gameStatus === 'playing' && !isAiThinking ? 0.95 : 1 }}
            >
              {cell}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Game Instructions */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">How to Play</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Get three in a row (horizontally, vertically, or diagonally)</li>
          <li>• Player X goes first</li>
          <li>• Take turns clicking empty squares</li>
          <li>• First to get three in a row wins!</li>
        </ul>
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
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          {content}
        </motion.div>
      </div>
    )
  }

  return content
}

export default TicTacToeGame

