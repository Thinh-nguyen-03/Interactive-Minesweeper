from tkinter import *
from tkinter import messagebox
import sys
import time
import global_var as gv
import utilities as utils

def reveal_square(grid, board, i, j, mine, flag):
    button = board[i][j]
    cell = grid.board[i][j]

    if button["image"] == "" and not cell.revealed:
        button["state"] = DISABLED
        button["relief"] = SUNKEN
    
        # Check if the clicked square is a bomb
        if cell.is_bomb:
            button.configure(bg = 'red')
            button["image"] = mine
            reveal_bombs(grid, board, mine)  
            gv.Result = False
            end_game(grid, board)
        else:
            # If the square is not a bomb, reveal it and update the game state
            cell.revealed = True
            gv.Squares_revealed += 1
            if cell.num_bombs_around != 0:
                button["text"] = cell.num_bombs_around
                # set color of button text based on number
                colors = ["blue", "green", "red", "purple", "maroon", "turquoise", "black", "gray"]
                button.configure(disabledforeground=colors[cell.num_bombs_around - 1])
            else:
                reveal_empty_squares(grid, board, i, j, mine, flag)
    
            # If all non-bomb squares have been revealed, end the game with a win
            if gv.Squares_revealed == (gv.Width * gv.Height - gv.Bombs):
                gv.Result = True
                end_game(grid, board)

def reveal_empty_squares(grid, board, i, j, mine, flag):
    for x in range(i - 1, i + 2):
        for y in range(j - 1, j + 2):
            if x < 0 or x >= gv.Height or y < 0 or y >= gv.Width:
                continue
            if grid.board[x][y].is_bomb or grid.board[x][y].revealed:
                continue
            reveal_square(grid, board, x, y, mine, flag)
            
def reveal_bombs(grid, board, mine):
    # Reveal all the squares containing bombs
    [board[i][j].configure(image=mine, state=NORMAL, relief=SUNKEN) for i in range(gv.Height) for j in range(gv.Width) if grid.board[i][j].is_bomb]


def left_click(grid, board, i, j, mine, flag):
    button = board[i][j]

    if button["image"] == "":
        reveal_square(grid, board, i, j, mine, flag)

def right_click(grid, board, i, j, flag):
    square = board[i][j]
    cell = grid.board[i][j]

    # Only allow flagging of unrevealed squares
    if not cell.revealed:
        # Add or remove the flag and update the game state
        square.configure(image=flag if square["image"] == "" else "", 
                      state=NORMAL if square["image"] == "" else DISABLED)
        gv.Num_bombs_left += 1 if square["image"] == "" else -1

def end_game(grid, board):
    # Decide game result and display appropriate message
    if gv.Result:
        title = "- OMG!!! YOU WON -"
        msg = f"CONGRATULATION ON FINALLY WINNING AFTER {gv.Loss_count} lOSSES. ONE MORE GAME?"
    else:
        title = "- ARGHH!!! UNLUCKY -"
        msg = f"NOT YOUR TIME YET! ONLY {gv.Loss_count} LOSSES, WANNA TRY AGAIN?"

    continue_game = messagebox.askyesno(title, msg)

    # Start a new game if the player wants to play again
    if continue_game == 1:
        gv.Loss_count += 1
        new_game(grid, board)
    else:
        gv.Lost_count = 0
        sys.exit()

def new_game(grid, board):
    # Reset the game board and start a new game
    for x in range(gv.Height):
        for y in range(gv.Width):
            grid.board[x][y].reset()
            board[x][y].configure(bg = '#C0C0C0')
            board[x][y]["image"] = ""
            board[x][y]["text"] = ""
            board[x][y]["state"] = DISABLED
            board[x][y]["relief"] = RAISED
    grid.add_bombs()
    gv.Squares_revealed = 0
    gv.Num_bombs_left = gv.Bombs
    gv.Init_time = time.time()
    gv.Result = None
