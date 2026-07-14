export class DomainError extends Error {
  public status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = "Unauthorized access") {
    super(message, 401);
  }
}

export class ForbiddenError extends DomainError {
  constructor(message = "Forbidden access") {
    super(message, 403);
  }
}

export class NotFoundError extends DomainError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

export class ValidationError extends DomainError {
  constructor(message = "Validation failed") {
    super(message, 400);
  }
}

export class ConflictError extends DomainError {
  constructor(message = "Resource conflict") {
    super(message, 409);
  }
}

export class PaymentError extends DomainError {
  constructor(message = "Payment processing failed") {
    super(message, 402);
  }
}

export class PlanUpgradeRequiredError extends DomainError {
  constructor(message = "Upgrade required to access this plan tier") {
    super(message, 402);
  }
}

export class QuotaExceededError extends DomainError {
  constructor(message = "Account quota has been exceeded") {
    super(message, 403);
  }
}
