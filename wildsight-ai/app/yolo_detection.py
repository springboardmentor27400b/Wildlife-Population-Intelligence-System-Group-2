from app.yolo_loader import model
from app.prediction import predict_species
from app.animal_identifier import identify_animal
from app.animal_behavior import detect_behavior
from app.species_status import get_species_status
from PIL import Image
from pathlib import Path
from app.taxonomy import get_taxonomy
import tempfile
import os
import cv2


print("NEW YOLO DETECTION FILE LOADED")


ANNOTATED_FOLDER = "uploads/annotated"

os.makedirs(
    ANNOTATED_FOLDER,
    exist_ok=True
)



def detect_animals(image_path):


    image = Image.open(
        image_path
    ).convert("RGB")


    opencv_image = cv2.imread(
        str(image_path)
    )


    results = model.predict(
        source=str(image_path),
        conf=0.5,
        verbose=False
    )


    detections = []



    for result in results:


        for box in result.boxes:



            x1, y1, x2, y2 = map(
                int,
                box.xyxy[0]
            )


            print(
                f"Bounding Box: {x1}, {y1}, {x2}, {y2}"
            )



            # Crop animal

            crop = image.crop(
                (
                    x1,
                    y1,
                    x2,
                    y2
                )
            )



            temp_path = None



            try:


                with tempfile.NamedTemporaryFile(
                    suffix=".jpg",
                    delete=False
                ) as temp:


                    temp_path = temp.name



                crop.save(
                    temp_path
                )



                print(
                    "Calling MobileNet..."
                )



                prediction = predict_species(
                    temp_path
                )
                species_status = get_species_status(
    prediction["species"]
)
                taxonomy = get_taxonomy(
    prediction["species"]
)

                print(
                    prediction
                )



                # Individual Identification

                animal_identity = identify_animal(
                    temp_path,
                    prediction["species"]
                )



                print(
                    "Animal Identity:"
                )

                print(
                    animal_identity
                )



                # Behavior Detection

                behavior = detect_behavior(
                    prediction["species"]
                )



            finally:


                if temp_path and os.path.exists(temp_path):

                    try:

                        os.remove(
                            temp_path
                        )

                    except PermissionError:

                        pass





            confidence = prediction["confidence"]



            # Label

            label = (

                f"{prediction['species']} "

                f"{confidence:.1f}% "

                f"{animal_identity['animalId']} "

                f"{behavior['behavior']}"

            )



            # Draw bounding box

            cv2.rectangle(

                opencv_image,

                (x1,y1),

                (x2,y2),

                (0,255,0),

                2

            )



            # Label background

            cv2.rectangle(

                opencv_image,

                (x1,max(y1-35,0)),

                (x1+300,y1),

                (0,255,0),

                -1

            )



            # Label text

            cv2.putText(

                opencv_image,

                label,

                (x1+5,max(y1-10,20)),

                cv2.FONT_HERSHEY_SIMPLEX,

                0.7,

                (0,0,0),

                2

            )





            # Store Detection Result

            detections.append({

                "species":
                prediction["species"],


                "confidence":
                confidence,


                "boundingBox":[

                    x1,

                    y1,

                    x2,

                    y2

                ],



                "animalId":

                animal_identity["animalId"],



                "existingAnimal":

                animal_identity["existingAnimal"],



                "similarity":

                animal_identity["similarity"],



                "behavior":

                behavior["behavior"],



                "possibleBehaviors":

                behavior["possibleBehaviors"],

                "endangered":
                species_status["endangered"],


                "speciesStatus":
                 species_status["speciesStatus"],


                "category":
                species_status["category"],


                "protectionLevel":
                species_status["protectionLevel"],

                "scientificName":
taxonomy["scientificName"],

"kingdom":
taxonomy["kingdom"],

"phylum":
taxonomy["phylum"],

"class":
taxonomy["className"],

"order":
taxonomy["order"],

"family":
taxonomy["family"],

"genus":
taxonomy["genus"],

            })





    # Save annotated image


    output_file = (

        f"annotated_"

        f"{Path(image_path).name}"

    )



    output_path = Path(
        ANNOTATED_FOLDER
    ) / output_file




    cv2.imwrite(

        str(output_path),

        opencv_image

    )




    return {


        "animalCount":

        len(detections),



        "annotatedImage":

        f"http://127.0.0.1:8000/uploads/annotated/{output_file}",



        "detections":

        detections,



        "model":

        "YOLO + MobileNetV2"

    }