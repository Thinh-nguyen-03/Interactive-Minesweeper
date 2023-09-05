from tkinter import *
import global_var as gv

def height_percent(percent):
    return (gv.Height / 100) * percent

def width_percent(percent):
    return (gv.Width / 100) * percent

def neighbours(i, j):
    # Loop over rows adjacent to the given row
    for x in range(max(0, i - 1), min(gv.Height, i + 2)):
        # Loop over columns adjacent to the given column
        for y in range(max(0, j - 1), min(gv.Width, j + 2)):
            # Check if the current cell is the original cell or not
            if x != i or y != j:
                # Yield the x, y coordinates of the adjacent cell
                yield (x, y)


