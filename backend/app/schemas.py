from typing import List, Optional, Any
from datetime import datetime
from pydantic import BaseModel, Field


class ReportBase(BaseModel):
    category: str = Field(..., description="Wet, Dry, Plastic, E-waste, Hazardous, Other")
    description: str = Field(..., min_length=5, description="Detailed problem description")
    location_address: str = Field(..., min_length=3, description="Street address or location descriptor")
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    reported_severity: str = Field("Medium", description="Low, Medium, High, Critical")


class ReportCreate(ReportBase):
    pass


class ReportUpdate(BaseModel):
    status: Optional[str] = Field(None, description="Pending, Assigned, In Progress, Resolved")
    assigned_collector: Optional[str] = None
    estimated_collection_date: Optional[str] = None
    internal_notes: Optional[str] = None
    recalculate_priority: Optional[bool] = False


class TimelineEventOut(BaseModel):
    id: int
    report_id: str
    status: str
    actor: str
    note: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True


class ReportResponse(BaseModel):
    id: int
    report_id: str
    category: str
    description: str
    location_address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_url: Optional[str] = None
    reported_severity: str
    calculated_priority: str
    priority_score: float
    priority_reasons: List[str] = []
    status: str
    assigned_collector: Optional[str] = None
    estimated_collection_date: Optional[str] = None
    internal_notes: Optional[str] = None
    is_demo: bool
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None
    timeline: Optional[List[TimelineEventOut]] = []

    class Config:
        from_attributes = True


class CategoryStat(BaseModel):
    name: str
    value: int
    color: Optional[str] = None


class StatusStat(BaseModel):
    name: str
    value: int
    color: Optional[str] = None


class PriorityStat(BaseModel):
    name: str
    value: int
    color: Optional[str] = None


class DashboardStats(BaseModel):
    total_reports: int
    pending_reports: int
    in_progress_reports: int
    resolved_reports: int
    high_priority_reports: int
    critical_priority_reports: int
    resolution_rate: float
    category_distribution: List[CategoryStat]
    status_distribution: List[StatusStat]
    priority_distribution: List[PriorityStat]
    recent_reports: List[ReportResponse]


class PriorityPreviewRequest(BaseModel):
    category: str
    reported_severity: str
    description: str
    location_address: Optional[str] = ""
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class PriorityPreviewResponse(BaseModel):
    score: float
    priority: str
    breakdown: List[str]
    factors_count: int
