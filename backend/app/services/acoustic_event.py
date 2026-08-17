EVENT_MAP = {

    "Alarm Call": {
        "event": "Threat Detected",
        "description": "The animal is warning nearby wildlife."
    },

    "Contact Call": {
        "event": "Communication",
        "description": "Animals are communicating within the group."
    },

    "Trumpet": {
        "event": "Social Interaction",
        "description": "Elephant herd communication."
    },

    "Roar": {
        "event": "Territorial Behaviour",
        "description": "The animal is defending its territory."
    },

    "Growl": {
        "event": "Aggressive Behaviour",
        "description": "Possible conflict detected."
    },

    "Chirp": {
        "event": "Routine Activity",
        "description": "Normal bird communication."
    },

    "Screech": {
        "event": "Night Hunting",
        "description": "Predatory bird activity."
    }

}


def detect_event(call_type):

    return EVENT_MAP.get(

        call_type,

        {

            "event":"Unknown",

            "description":"Unable to classify."

        }

    )