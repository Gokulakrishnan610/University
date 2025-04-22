# common/utils.py

from datetime import datetime


def get_current_year():
    return datetime.now().year


def get_semester_by_month(month=None):
    if month is None:
        month = datetime.now().month

    if month in [1, 2, 3, 4]:
        return 'Spring'
    elif month in [5, 6, 7, 8]:
        return 'Summer'
    else:
        return 'Fall'

