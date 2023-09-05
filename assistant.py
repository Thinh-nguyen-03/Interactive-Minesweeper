# Import modules
import pyttsx3 # Text to speech module
import datetime # Date and time module
import speech_recognition as sr # Speech Recognition module
import os # Operating System module
import pyautogui # This module allows you to take a screenshot
import psutil # Process and system utilities
import pyjokes # Module supporting the jokes function
from googlesearch import search
import sys

# Init
engine = pyttsx3.init()
voices = engine.getProperty('voices')
engine.setProperty('voices', voices[0].id)
newVoiceRate = 230 # set the voice rate
engine.setProperty('rate', newVoiceRate)

# speaks the text
def speak(audio):
    engine.say(audio)
    engine.runAndWait()

# Gets the current time
def time():
    Time = datetime.datetime.now().strftime("%H:%M:%S") # 24-hour format
    speak("It's" + Time + "now")

# Gets the current date
def date():
    # Weekday
    today_weekday = datetime.datetime.today().weekday() + 1 
    week = { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 
             5: 'Friday', 6: 'Saturday', 7: 'Sunday' }
    if today_weekday in week.keys():
        weekday = week[today_weekday]
        
    # Date 
    today_date = datetime.datetime.now().day
    dates = { 1: 'the first', 2: 'the second', 3: 'the third', 4: 'the fourth', 
              5: 'the fifth', 6: 'the sixth', 7: 'the seventh', 8: 'the eighth', 
              9: 'the ninth', 10: 'the tenth', 11: 'the eleventh', 12: 'the twelfth', 
              13: 'the thirteenth', 14: 'the fourteenth', 15: 'the fifteenth', 
              16: 'the sixteenth', 17: 'the seventeenth', 18: 'the eighteenth', 
              19: 'the nineteenth', 20: 'the twentieth', 21: 'the twenty first', 
              22: 'the twenty second', 23: 'the twenty third', 24: 'the twenty fourth', 
              25: 'the twenty fifth', 26: 'the twenty sixth', 27: 'the twenty seventh', 
              28: 'the twenty eighth', 29: 'the twenty ninth', 30: 'the thirtieth', 
              31: 'the thirty-first' }
    if today_date in dates.keys():
        date = dates[today_date]
        
    # Month
    today_month = datetime.datetime.now().month
    months = { 1: 'January', 2: 'February', 3: 'March', 4: 'April', 5: 'May', 
               6: 'June', 7: 'July', 8: 'August', 9: 'September', 10: 'October', 
              11: 'November', 12: 'December' }
    if today_month in months.keys():
        month = months[today_month]
        
    # Year
    year = str(datetime.datetime.now().year)
    
    speak("Today is" + weekday + month + date + year)

# Greets the user
def wishme():
    speak("Welcome back")
    hour = datetime.datetime.now().hour
    
    # Greetings
    if hour >= 6 and hour < 12:
        speak("Good morning")
    elif hour >= 12 and hour < 18:
        speak("Good afternoon")
    elif hour >= 18 and hour < 24:
        speak("Good evening")
    else:
        speak("Good night")
        
    speak("How can I help you today")

# Gets commands from user
def take_command():
    
    # Record Audio
    r = sr.Recognizer()
    with sr.Microphone() as source:
        r.pause_threshold = 3
        audio = r.listen(source)
        
    # Speech recognition using Google Speech Recognition
    data = ""
    try:
        data = r.recognize_google(audio)
    except sr.UnknownValueError:
        speak("Say that again please...")
    except sr.RequestError as e:
        speak("Say that again please...")
    
    return data

# Captures screenshots
def screenshot():
    capture = pyautogui.screenshot()
    capture.save("screenshot/ss.png") # Save the sceenshot as a .png file

# Gets CPU and battery
def cpu():
    # Get the CPU usage
    usage = str(psutil.cpu_percent())
    print(usage)
    speak("CPU is at" + usage)
    # Get the battery percentage
    battery = psutil.sensors_battery
    print(battery)
    speak("battery is at " + str(battery().percent) + " percent")

# Tell a joke
def jokes():
    speak(pyjokes.get_joke())

# Main function
if __name__ == '__main__':
    wishme()
    while True:
        query = take_command().lower()
        print(query)
        if "time" in query:
            time()
        elif "date" in query:
            date()
    
        elif "logout" in query:
            os.system("shutdown - l")
        elif "shutdown" in query:
            os.system("shutdown /s /t 1")
        elif "restart" in query:
            os.system("shutdown - /r /t 1")
        elif "remember that" in query:
            speak("What should I remember?")
            data = take_command()
            speak("I have to remember that" + data)
            remember = open("data.txt", "w") # open the data.txt file
            remember.write(data) # write in the file
            remember.close() # close the file
        elif "screenshot" in query:
            screenshot()
            speak("The screen has been captured")
        elif "cpu" in query:
            cpu()
        elif "joke" in query:
            jokes()
        elif "stop" in query:
            sys.exit()
            
            
'''    
# setting #####################################################################
AI_voices = pyttsx3.init()
voice = AI_voices.getProperty("voices")
AI_voices.setProperty("voice", voice[1].id)

def create_setting_button(top_frame):
    def open():
        # top = Toplevel()
        # top.title("Voice")
        speak("Can I help you")
        while True:
            query=command().lower()
            speak("What should I search")
            url = f"https://google.com/search?q={query}"
            wb.get().open(url)
            speak(f'Here is your {query} on google')
            if "out" in query:
                speak("Goodbye. Have a good day")
                destroy()

    newgame_button = Button( top_frame, bd=1, width=15, text="Setting",command=open) # button setting
    newgame_button.grid(row=0, column=2, padx = 0)

'''

