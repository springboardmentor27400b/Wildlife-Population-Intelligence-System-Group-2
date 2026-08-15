package com.wildsight.backend.config;


import com.wildsight.backend.entity.ConservationLocation;
import com.wildsight.backend.repository.ConservationLocationRepository;


import lombok.RequiredArgsConstructor;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;


import java.util.ArrayList;
import java.util.List;



@Component
@RequiredArgsConstructor
public class ConservationLocationSeeder
        implements CommandLineRunner {



    private final ConservationLocationRepository repository;



    @Override
    public void run(String... args) {


        System.out.println(
                "========== Conservation Location Seeder =========="
        );


        List<ConservationLocation> locations = List.of(


            createLocation(
                "Bandipur Tiger Reserve",
                "Karnataka",
                11.6668,
                76.6250,
                "Tiger Reserve",
                "Important tiger and elephant habitat"
            ),


            createLocation(
                "Kaziranga National Park",
                "Assam",
                26.5775,
                93.1711,
                "National Park",
                "One horned rhinoceros habitat"
            ),


            createLocation(
                "Gir National Park",
                "Gujarat",
                21.1240,
                70.8242,
                "Lion Reserve",
                "Asian lion conservation area"
            ),


            createLocation(
                "Jim Corbett National Park",
                "Uttarakhand",
                29.5300,
                78.7747,
                "Tiger Reserve",
                "Oldest national park of India with tiger habitat"
            ),


            createLocation(
                "Ranthambore National Park",
                "Rajasthan",
                26.0173,
                76.5026,
                "Tiger Reserve",
                "Famous tiger landscape ecosystem"
            ),


            createLocation(
                "Kanha National Park",
                "Madhya Pradesh",
                22.3340,
                80.6115,
                "Tiger Reserve",
                "Central Indian tiger habitat"
            ),


            createLocation(
                "Pench National Park",
                "Madhya Pradesh",
                21.7600,
                79.3000,
                "Tiger Reserve",
                "Tiger corridor ecosystem"
            ),


            createLocation(
                "Tadoba Andhari Tiger Reserve",
                "Maharashtra",
                20.2240,
                79.3650,
                "Tiger Reserve",
                "Major tiger conservation landscape"
            ),


            createLocation(
                "Sundarbans National Park",
                "West Bengal",
                21.9497,
                88.9403,
                "Mangrove Reserve",
                "Mangrove forest and Bengal tiger habitat"
            ),


            createLocation(
                "Periyar Wildlife Sanctuary",
                "Kerala",
                9.4620,
                77.2360,
                "Wildlife Sanctuary",
                "Elephant and biodiversity hotspot"
            ),


            createLocation(
                "Nagarhole National Park",
                "Karnataka",
                12.0090,
                76.0060,
                "Tiger Reserve",
                "Western Ghats wildlife corridor"
            ),


            createLocation(
                "Mudumalai Wildlife Sanctuary",
                "Tamil Nadu",
                11.6000,
                76.5500,
                "Wildlife Sanctuary",
                "Nilgiri elephant corridor"
            ),


            createLocation(
                "Silent Valley National Park",
                "Kerala",
                11.1500,
                76.4300,
                "Rainforest Reserve",
                "Tropical rainforest ecosystem"
            ),


            createLocation(
                "Similipal National Park",
                "Odisha",
                21.8500,
                86.3600,
                "Biosphere Reserve",
                "Tiger and elephant biodiversity region"
            ),


            createLocation(
                "Manas National Park",
                "Assam",
                26.7200,
                91.0000,
                "National Park",
                "UNESCO biodiversity region"
            ),


            createLocation(
                "Great Himalayan National Park",
                "Himachal Pradesh",
                31.7300,
                77.5300,
                "National Park",
                "Mountain ecosystem conservation area"
            ),


            createLocation(
                "Dudhwa National Park",
                "Uttar Pradesh",
                28.5300,
                80.6200,
                "National Park",
                "Terai grassland ecosystem"
            ),


            createLocation(
                "Satpura National Park",
                "Madhya Pradesh",
                22.4800,
                78.4000,
                "National Park",
                "Central Indian forest ecosystem"
            ),


            createLocation(
                "Desert National Park",
                "Rajasthan",
                26.8600,
                70.9000,
                "Desert Reserve",
                "Desert wildlife ecosystem"
            ),


            createLocation(
                "Valmiki National Park",
                "Bihar",
                27.3300,
                84.2500,
                "Tiger Reserve",
                "Eastern Himalayan foothill ecosystem"
            )

        );



        repository.saveAll(locations);



        System.out.println(
                "========== Conservation Locations Updated =========="
        );

    }




    private ConservationLocation createLocation(
            String name,
            String state,
            Double latitude,
            Double longitude,
            String type,
            String description
    ){


        return repository
                .findByLocationName(name)
                .orElseGet(() ->

                    ConservationLocation.builder()

                    .locationName(name)

                    .state(state)

                    .country("India")

                    .latitude(latitude)

                    .longitude(longitude)

                    .locationType(type)

                    .protectedArea("YES")

                    .description(description)

                    .surveys(new ArrayList<>())

                    .build()

                );

    }


}