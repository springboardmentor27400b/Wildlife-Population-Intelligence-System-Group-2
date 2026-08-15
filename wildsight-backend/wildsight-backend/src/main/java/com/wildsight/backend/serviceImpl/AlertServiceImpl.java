package com.wildsight.backend.serviceImpl;

import com.wildsight.backend.entity.Habitat;
import com.wildsight.backend.entity.MonitoringDevice;
import com.wildsight.backend.entity.PopulationEstimate;
import com.wildsight.backend.entity.Species;
import com.wildsight.backend.entity.User;
import com.wildsight.backend.entity.Notification;

import com.wildsight.backend.repository.HabitatRepository;
import com.wildsight.backend.repository.MonitoringDeviceRepository;
import com.wildsight.backend.repository.PopulationEstimateRepository;
import com.wildsight.backend.repository.SpeciesRepository;
import com.wildsight.backend.repository.UserRepository;
import com.wildsight.backend.repository.NotificationRepository;

import com.wildsight.backend.service.AlertService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AlertServiceImpl implements AlertService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    private final SpeciesRepository speciesRepository;
    private final PopulationEstimateRepository populationEstimateRepository;
    private final HabitatRepository habitatRepository;
    private final MonitoringDeviceRepository monitoringDeviceRepository;


    @Override
    @Transactional
    public void generateAlerts() {

        /*
         * ============================================================
         * 1. ENDANGERED SPECIES ALERTS
         * ============================================================
         */

        List<Species> speciesList = speciesRepository.findAll();

        for (Species species : speciesList) {

            boolean endangered = false;

            if (species.getIucnStatus() != null &&
                    species.getIucnStatus()
                            .equalsIgnoreCase("EN")) {

                endangered = true;
            }

            if (species.getConservationStatus() != null &&
                    species.getConservationStatus()
                            .toLowerCase()
                            .contains("endangered")) {

                endangered = true;
            }

            if (endangered) {

                String title = "Endangered Species Alert";

                String message =
                        "Endangered species detected: "
                                + species.getCommonName()
                                + " ("
                                + species.getScientificName()
                                + "). Immediate conservation monitoring is recommended.";

                createNotificationForActiveUsers(
                        title,
                        message,
                        "ENDANGERED_SPECIES"
                );
            }
        }


        /*
         * ============================================================
         * 2. POPULATION DECLINE ALERTS
         * ============================================================
         */

        List<PopulationEstimate> populationList =
                populationEstimateRepository.findAll();

        for (PopulationEstimate population : populationList) {

            if (population.getGrowthRate() != null &&
                    population.getGrowthRate().doubleValue() < 0) {

                String speciesName = "Unknown Species";

                if (population.getSpecies() != null) {

                    speciesName =
                            population.getSpecies().getCommonName();
                }

                String location = "Unknown Location";

                if (population.getSurvey() != null &&
                        population.getSurvey().getLocation() != null) {

                    location =
                            population.getSurvey()
                                    .getLocation()
                                    .getLocationName();
                }

                String title =
                        "Population Decline Alert";

                String message =
                        "Population decline detected for "
                                + speciesName
                                + " at "
                                + location
                                + ". Growth rate: "
                                + population.getGrowthRate()
                                + "%. Conservation assessment is recommended.";

                createNotificationForActiveUsers(
                        title,
                        message,
                        "POPULATION_DECLINE"
                );
            }
        }


        /*
         * ============================================================
         * 3. HABITAT DEGRADATION ALERTS
         * ============================================================
         */

        List<Habitat> habitats =
                habitatRepository.findAll();

        for (Habitat habitat : habitats) {

            if (habitat.getDegradationLevel() == null) {
                continue;
            }

            double degradation =
                    habitat.getDegradationLevel();

            if (degradation >= 50) {

                String riskLevel;

                if (degradation >= 75) {
                    riskLevel = "CRITICAL";
                } else {
                    riskLevel = "HIGH";
                }

                String title =
                        "Habitat Degradation Alert";

                String message =
                        habitat.getHabitatName()
                                + " is experiencing "
                                + riskLevel
                                + " habitat degradation. "
                                + "Degradation level: "
                                + degradation
                                + "%. Restoration action is recommended.";

                createNotificationForActiveUsers(
                        title,
                        message,
                        "HABITAT_DEGRADATION"
                );
            }
        }


        /*
         * ============================================================
         * 4. MONITORING DEVICE ALERTS
         * ============================================================
         */

        List<MonitoringDevice> devices =
                monitoringDeviceRepository.findAll();

        for (MonitoringDevice device : devices) {

            if (device.getStatus() == null) {
                continue;
            }

            String status =
                    device.getStatus()
                            .name();

            if (!status.equalsIgnoreCase("ACTIVE")) {

                String deviceName =
                        device.getDeviceName() != null
                                ? device.getDeviceName()
                                : "Unknown Device";

                String locationName =
                        "Unknown Location";

                if (device.getLocation() != null) {

                    locationName =
                            device.getLocation()
                                    .getLocationName();
                }

                String title =
                        "Monitoring Device Alert";

                String message =
                        "Monitoring device "
                                + deviceName
                                + " at "
                                + locationName
                                + " is currently "
                                + status
                                + ". Please inspect the device.";

                createNotificationForActiveUsers(
                        title,
                        message,
                        "MONITORING_DEVICE"
                );
            }
        }
    }


    /*
     * ================================================================
     * CREATE NOTIFICATION FOR ACTIVE USERS
     * ================================================================
     */

    private void createNotificationForActiveUsers(
            String title,
            String message,
            String notificationType) {

        List<User> users =
                userRepository.findAll();

        for (User user : users) {

            if (user.getStatus() != null &&
                    !user.getStatus()
                            .equalsIgnoreCase("ACTIVE")) {

                continue;
            }

            /*
             * Prevent duplicate notifications
             */

            boolean alreadyExists =
                    notificationRepository
                            .existsByUserUserIdAndTitleAndMessage(
                                    user.getUserId(),
                                    title,
                                    message
                            );

            if (alreadyExists) {
                continue;
            }


            Notification notification =
                    Notification.builder()
                            .user(user)
                            .title(title)
                            .message(message)
                            .notificationType(notificationType)
                            .isRead(false)
                            .readAt(null)
                            .build();

            notificationRepository.save(notification);
        }
    }
}