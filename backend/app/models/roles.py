from enum import Enum


class UserRole(str, Enum):
    wildlife_researcher = "wildlife_researcher"
    conservation_officer = "conservation_officer"
    forest_department_officer = "forest_department_officer"
    administrator = "administrator"