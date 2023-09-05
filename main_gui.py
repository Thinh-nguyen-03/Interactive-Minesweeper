from tkinter import *   
import tkinter.font as tkf
import pyglet
import time

import board
import handlers
import global_var as gv

# Main unresizable window 
def main_window():
    window = Tk()
    window.title("Minesweeper")
    window.configure(bg = '#C0C0C0')    
    window.resizable(width = False, height = False)
    window.iconbitmap("images/mine_icon.ico")
    return window

# Images 
def create_images():
    flag = PhotoImage(file = "images/red_flag.png").subsample(2)
    mine = PhotoImage(file = "images/mine.png").subsample(2)
    smiley = PhotoImage(file="images/smiley_face.png").subsample(2)
    dead = PhotoImage(file="images/dead_face.png").subsample(2)
    cool = PhotoImage(file="images/cool_face.png").subsample(2)
    return (flag, mine, smiley, dead, cool)

# Game frame 
def create_board(window, GRID, flag, mine):
    game_frame = Frame(window, bg = '#C0C0C0', bd = 3, relief = SUNKEN)
    def create_square(i, j):
        f = Frame(game_frame, bg = '#C0C0C0', height = 30, width = 30)
        s = Button(f, bg = '#C0C0C0', bd = 1, state = "normal",
                   font = ("Lucida Console", 12, "bold"), relief = RAISED)
        s.pack(fill = BOTH, expand = True)
    
        # buttons bindings
        def __handler(action, x = i, y = j):
            if action.num == 1:
                handlers.left_click(GRID, BOARD, i, j, mine, flag)
            elif action.num == 3:
                handlers.right_click(GRID, BOARD, i, j, flag)
            else:
                raise Exception('Invalid event code.')

        s.bind("<Button-1>", __handler)
        s.bind("<Button-3>", __handler)

        f.pack_propagate(False)
        f.grid(row = i, column = j)
        
        return s

    BOARD = [[create_square(i, j) for j in range(gv.Width)] for i in range(gv.Height)]
    game_frame.pack(padx = 5, pady = 5, side = BOTTOM)
    
    return BOARD

# task bar (main)
def create_task_bar(window, grid, board, smiley, dead, cool):
    top_frame = Frame(window, bg = '#C0C0C0', bd = 3, height = 42, relief = SUNKEN)
    top_frame.pack(padx = 0, pady = 0, side = TOP, fill = "x") 
    top_frame.pack()
    for i in range(4):
        top_frame.columnconfigure(i, weight = 1)

    create_bombs_counter(top_frame)
    create_center_button(top_frame, grid, board, smiley, dead, cool)
    #create_setting_button(top_frame)
    create_time_counter(top_frame)
    #create_difficulty_menu(top_frame, grid, board)
    
    top_frame.pack(padx = 5, pady = 5, side = TOP)

    return top_frame

# bombs 
def create_bombs_counter(top_frame):
    """ bombs_counter, left """
    bombs_counter_str = StringVar()

    def update_bombs_counter():
        bombs_counter_str.set('{:03d}'.format(gv.Num_bombs_left))
        top_frame.after(100, update_bombs_counter)
    update_bombs_counter();

    bombs_counter = Label(top_frame, height = 1, width = 3, bg = 'black', fg = 'red', 
                          textvariable = bombs_counter_str,
                          font=tkf.Font(family = 'Terminal', size = 17), anchor = 'center')
    bombs_counter.grid(row = 0, column = 0, padx = 5, pady = 5, sticky = "nsW")

    # Reset the number of bombs left when a new game is started
    def reset_bombs_counter():
        gv.Num_bombs_left = gv.Bombs

def create_center_button(top_frame, grid, board, smile, dead, cool):
    """ face button, middle """
    def _start_new_game(g = grid, b = board):
        handlers.new_game(grid, board)
    
    def on_button_press(event):
        center_button.configure(relief = SUNKEN)

    def on_button_release(event):
        center_button.configure(relief = RAISED)

    center_button = Button(top_frame, height = 25, width = 25, bd = 3, image = smile,
                           command = _start_new_game, compound = 'center', relief = RAISED)
    center_button.grid(row = 0, column = 1, padx = 0, pady = 5, sticky = "ns", columnspan = 2)
    center_button.bind("<Button-1>", on_button_press)
    center_button.bind("<ButtonRelease-1>", on_button_release)
    
    def update_center_button_image():
        """ Update image to dead if a bomb is clicked """
        if gv.Result:
            center_button.configure(image = cool)
        elif gv.Result == None:
            center_button.configure(image = smile) 
        else:
            center_button.configure(image = dead)
        top_frame.after(100, update_center_button_image)
    update_center_button_image()

def create_time_counter(top_frame):
    time_counter_str = StringVar()

    def update_time_counter():
        elapsed_time = int(time.time() - gv.Init_time)
        minutes = elapsed_time // 60
        seconds = elapsed_time % 60
        time_string = f"{minutes:02d}:{seconds:02d}"
        time_counter_str.set(time_string)
        top_frame.after(100, update_time_counter)
    update_time_counter();
    
    time_counter = Label(top_frame, height = 1, width = 5, bg = 'black', fg = 'red', 
                         textvariable = time_counter_str,
                         font = tkf.Font(family = 'Terminal', size = 17), anchor = 'center')
    time_counter.grid(row = 0, column = 4, padx = 5, pady = 5, sticky = "nsNE")

    # Reset the initial time when a new game is started
    def reset_time_counter():
        gv.Init_time = time.time()
        time_counter_str.set("00:00")
    reset_time_counter()
    