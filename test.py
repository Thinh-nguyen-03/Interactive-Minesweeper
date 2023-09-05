from tkinter import *
import global_var
import utilities
from cell import Cell

window = Tk()
# Window setting
window.configure(bg = '#C0C0C0')
window.geometry(f'{global_var.Width}x{global_var.Height}')
window.title("Minesweeper")
window.resizable(False, False)

top_frame = Frame(
    window, 
    bg = '#C0C0C0',
    width = utilities.width_percent(97),
    height = utilities.height_percent(14),
    relief = 'sunken',
    borderwidth = 8
)
top_frame.place(
    relx = 0.5, 
    x = -utilities.width_percent(48.5), 
    y = utilities.height_percent(2)
)

# Create a center frame with a light gray background, a sunken relief style, and a border width of 8
center_frame = Frame(
    window, 
    bg = '#C0C0C0', 
    width = utilities.width_percent(97),
    height = utilities.height_percent(80),
    relief = 'sunken', 
    borderwidth = 8
)
center_frame.place(
    relx = 0.5, 
    x = -utilities.width_percent(48.5), 
    y = utilities.height_percent(18)
)

# Create window
window.mainloop()

