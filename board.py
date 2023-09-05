import random
import utilities
import numpy as np
import global_var as gv

class Square(): 
    # Initialize the object with x and y coordinates
    def __init__(self, x, y): 
        self.x = x 
        self.y = y 
        self.reset() 

    # Reset the properties of the square
    def reset(self): 
        self.is_bomb = False 
        self.revealed = False 
        self.num_bombs_around = 0 
        
    def flag(self):
        self.flagged = True

    def unflag(self):
        self.flagged = False
        
    # Reveal the square
    def reveal(self): 
        self.revealed = True 
        # Return information about properties of the square
        return (self.is_bomb, self.num_bombs_around) 
    
    # Define a string representation of the square
    def __str__(self):
        if self.is_bomb:
            return "."
        else:
            return str(self.num_bombs_around)

class Grid():
    # Build the game board by creating a two-dimensional list of Squares
    def __init__(self):
        self.board = np.array([Square(i, j) for j in range(gv.Width) for i in range(gv.Height)])
        self.board.shape = (gv.Height, gv.Width)

    # Reset each Squares in the board to their original state
    def reset(self):
        for row in self.board:
            for square in row:
                square.reset()
                square.revealed = False
                
    # Add bombs to the game board randomly
    def add_bombs(self):
        board_area = gv.Height * gv.Width
        if gv.Bombs <= 0 or gv.Bombs >= board_area:
            # Raise an exception for invalid number of bombs
            raise Exception("Invalid number of bombs.")
        else:
            # Create a set of coordinates representing non-bomb squares
            non_bomb_squares = set((i, j) for j in range(gv.Width) for i in range(gv.Height))
            # Choose random coordinates for bomb squares
            bomb_squares = set(random.sample(non_bomb_squares, gv.Bombs))
             # Place bombs on the board
            for (i, j) in bomb_squares:
                self.board[i][j].is_bomb = True
            # Update the surrounding non-bomb squares after a bomb is added
            # Only update squares that are still non-bombs
            for (i, j) in bomb_squares:
                for (x, y) in utilities.neighbours(i, j):
                    if (x, y) in non_bomb_squares:
                        self.board[x][y].num_bombs_around += 1

    # Display the game board w/ dots represent boms 
    # and the number on non-bomb squares represent the number of bombs surrounding them
    def display(self):
        for row in self.board:
            print(" ".join(str(square) for square in row))
