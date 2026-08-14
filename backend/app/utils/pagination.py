from typing import Generic, List, TypeVar, Any
from pydantic import BaseModel

T = TypeVar("T")

class Page(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int
    pages: int

def paginate(items: List[Any], total: int, page: int, page_size: int) -> Page[Any]:
    pages = (total + page_size - 1) // page_size if page_size > 0 else 0
    return Page(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        pages=pages
    )
