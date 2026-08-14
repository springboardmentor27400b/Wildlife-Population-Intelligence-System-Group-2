import enum

class UserRole(str, enum.Enum):
    ADMINISTRATOR = "Administrator"
    RESEARCHER = "Wildlife Researcher"
    CONSERVATION_OFFICER = "Conservation Officer"
    FOREST_DEPT_OFFICER = "Forest Department Officer"

class SurveyStatus(str, enum.Enum):
    PLANNED = "Planned"
    ACTIVE = "Active"
    COMPLETED = "Completed"

class DeviceStatus(str, enum.Enum):
    ACTIVE = "Active"
    INACTIVE = "Inactive"
    MAINTENANCE = "Maintenance"

class HabitatType(str, enum.Enum):
    FOREST = "Forest"
    GRASSLAND = "Grassland"
    WETLAND = "Wetland"
    DESERT = "Desert"
    MOUNTAIN = "Mountain"
    TUNDRA = "Tundra"
    SHRUBLAND = "Shrubland"
    OTHER = "Other"
