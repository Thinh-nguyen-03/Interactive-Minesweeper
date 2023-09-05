from tkinter import *
import sys

import board as cls
import main_gui



# Initialisation of the data ###################################################
GRID = cls.Grid()
GRID.add_bombs()

# Creation of the GUI ##########################################################
window = main_gui.main_window()
flag, mine, smiley, dead, cool = main_gui.create_images()
BOARD_IN_GAME = main_gui.create_board(window, GRID, flag, mine)
top_frame = main_gui.create_task_bar(window, GRID, BOARD_IN_GAME, smiley, dead, cool)

mainloop()
