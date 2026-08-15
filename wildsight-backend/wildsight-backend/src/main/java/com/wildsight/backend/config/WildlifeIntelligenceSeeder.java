package com.wildsight.backend.config;


import com.wildsight.backend.entity.*;
import com.wildsight.backend.repository.*;

import lombok.RequiredArgsConstructor;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;


import java.math.BigDecimal;
import java.time.LocalDate;



@Component
@RequiredArgsConstructor
public class WildlifeIntelligenceSeeder 
        implements CommandLineRunner {


    private final UserRepository userRepository;

    private final ConservationLocationRepository locationRepository;

    private final SpeciesRepository speciesRepository;

    private final SurveyRepository surveyRepository;

    private final HabitatRepository habitatRepository;

    private final PopulationEstimateRepository populationRepository;

    private final BiodiversityScoreRepository biodiversityRepository;



@Override
public void run(String... args){


System.out.println(
"========== Wildlife Intelligence Seeder =========="
);



User user =
userRepository
.findByEmail("admin@gmail.com")
.orElse(null);



if(user==null){

System.out.println(
"Admin not found"
);

return;

}




createWildlifeData(
"Kaziranga National Park",
"One Horned Rhinoceros",
"Rhinoceros unicornis",
2600,
91,
94,
180,
user
);



createWildlifeData(
"Jim Corbett National Park",
"Bengal Tiger",
"Panthera tigris",
250,
88,
90,
150,
user
);



createWildlifeData(
"Ranthambore National Park",
"Bengal Tiger",
"Panthera tigris",
85,
82,
86,
120,
user
);



createWildlifeData(
"Kanha National Park",
"Bengal Tiger",
"Panthera tigris",
120,
90,
92,
170,
user
);



createWildlifeData(
"Pench National Park",
"Bengal Tiger",
"Panthera tigris",
70,
85,
88,
130,
user
);



createWildlifeData(
"Tadoba Andhari Tiger Reserve",
"Bengal Tiger",
"Panthera tigris",
115,
87,
89,
140,
user
);



createWildlifeData(
"Sundarbans National Park",
"Royal Bengal Tiger",
"Panthera tigris",
100,
86,
90,
200,
user
);



createWildlifeData(
"Periyar Wildlife Sanctuary",
"Asian Elephant",
"Elephas maximus",
1100,
89,
91,
160,
user
);



createWildlifeData(
"Nagarhole National Park",
"Asian Elephant",
"Elephas maximus",
800,
92,
93,
190,
user
);



createWildlifeData(
"Mudumalai Wildlife Sanctuary",
"Asian Elephant",
"Elephas maximus",
600,
88,
90,
150,
user
);



createWildlifeData(
"Silent Valley National Park",
"Lion-tailed Macaque",
"Macaca silenus",
300,
95,
97,
120,
user
);



createWildlifeData(
"Similipal National Park",
"Royal Bengal Tiger",
"Panthera tigris",
28,
88,
90,
150,
user
);



createWildlifeData(
"Manas National Park",
"Golden Langur",
"Trachypithecus geei",
2500,
86,
92,
180,
user
);



createWildlifeData(
"Great Himalayan National Park",
"Snow Leopard",
"Panthera uncia",
60,
90,
95,
200,
user
);



createWildlifeData(
"Dudhwa National Park",
"Swamp Deer",
"Rucervus duvaucelii",
2200,
85,
88,
140,
user
);



createWildlifeData(
"Satpura National Park",
"Sloth Bear",
"Melursus ursinus",
500,
87,
89,
130,
user
);



createWildlifeData(
"Desert National Park",
"Great Indian Bustard",
"Ardeotis nigriceps",
150,
75,
82,
90,
user
);



createWildlifeData(
"Valmiki National Park",
"Bengal Tiger",
"Panthera tigris",
54,
84,
87,
120,
user
);



System.out.println(
"========== Wildlife Intelligence Completed =========="
);


}






private void createWildlifeData(

String locationName,
String animal,
String scientificName,
Integer populationCount,
double habitatScore,
double biodiversityScore,
int speciesCount,
User user

){



ConservationLocation location =
locationRepository
.findByLocationName(locationName)
.orElse(null);



if(location==null){

System.out.println(
locationName+" missing"
);

return;

}






Species species =
speciesRepository
.findByCommonName(animal)
.orElseGet(() ->


speciesRepository.save(

Species.builder()

.categoryId(1L)

.commonName(animal)

.scientificName(scientificName)

.conservationStatus(
"Endangered"
)

.iucnStatus(
"EN"
)

.description(
"Wildlife conservation species"
)

.build()

)

);






Survey survey =
surveyRepository
.findBySurveyName(
locationName+" Wildlife Survey"
)
.orElseGet(() ->


surveyRepository.save(

Survey.builder()

.user(user)

.location(location)

.surveyName(
locationName+" Wildlife Survey"
)

.description(
"AI assisted wildlife monitoring survey"
)

.habitatType(
"Natural Ecosystem"
)

.protectedArea(
locationName
)

.surveyDate(
LocalDate.now()
)

.status(
"Completed"
)

.build()

)

);








Habitat habitat =
habitatRepository
.findAll()
.stream()
.filter(

h ->

h.getSurvey()!=null
&&
h.getSurvey()
.getSurveyId()
.equals(
survey.getSurveyId()
)

)
.findFirst()
.orElseGet(() ->



habitatRepository.save(

Habitat.builder()

.habitatName(
locationName+" Habitat"
)

.habitatType(
"Forest Ecosystem"
)

.vegetationType(
"Natural Vegetation"
)

.description(
"Wildlife habitat monitoring data"
)

.habitatQualityScore(
habitatScore
)

.degradationLevel(
100-habitatScore
)

.vegetationDensity(
habitatScore
)

.temperature(
26.0
)

.humidity(
75.0
)

.rainfall(
200.0
)

.waterQuality(
85.0
)

.airQuality(
90.0
)

.suitabilityScore(
habitatScore
)

.survey(survey)

.build()

)

);








if(!populationRepository
.existsBySurveySurveyId(
survey.getSurveyId()
))
{


populationRepository.save(

PopulationEstimate.builder()

.species(species)

.survey(survey)

.estimatedPopulation(
populationCount
)

.density(
new BigDecimal("10.5")
)

.growthRate(
new BigDecimal("3.5")
)

.migrationPattern(
"Seasonal wildlife movement"
)

.build()

);


}







if(!biodiversityRepository
.existsBySurveySurveyId(
survey.getSurveyId()
))
{


biodiversityRepository.save(

BiodiversityScore.builder()

.survey(survey)

.habitat(habitat)

.speciesDiversityScore(
BigDecimal.valueOf(
biodiversityScore
)
)

.habitatQualityScore(
BigDecimal.valueOf(
habitatScore
)
)

.ecosystemHealthScore(
BigDecimal.valueOf(
(habitatScore+biodiversityScore)/2
)
)

.overallScore(
BigDecimal.valueOf(
biodiversityScore
)
)

.speciesCount(
speciesCount
)

.healthStatus(
"Healthy"
)

.build()

);


}



System.out.println(
locationName+
" intelligence completed"
);


}



}