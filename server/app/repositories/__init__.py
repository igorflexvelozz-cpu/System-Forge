from ..repositories.firestore import FirestoreRepository

class UploadRepository(FirestoreRepository):
    def __init__(self):
        super().__init__("uploads")

class ProcessRepository(FirestoreRepository):
    def __init__(self):
        super().__init__("processes")

class DataRepository(FirestoreRepository):
    def __init__(self):
        super().__init__("data")

class SLARepository(FirestoreRepository):
    def __init__(self):
        super().__init__("sla")

class RankingsRepository(FirestoreRepository):
    def __init__(self):
        super().__init__("rankings")

class LogsRepository(FirestoreRepository):
    def __init__(self):
        super().__init__("logs")