CREATE EXTENSION postgis;

-- CreateTable
CREATE TABLE "Location" (
    "id" SERIAL NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "geom" geometry(Point,4326) NOT NULL,
    "zip" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "cityId" INTEGER NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurrencyCode" (
    "id" SERIAL NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "currencySymbol" TEXT NOT NULL,

    CONSTRAINT "CurrencyCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeZone" (
    "id" SERIAL NOT NULL,
    "zoneName" TEXT NOT NULL,
    "gmtOffset" INTEGER NOT NULL,
    "gmtOffsetName" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "tzName" TEXT NOT NULL,

    CONSTRAINT "TimeZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" SERIAL NOT NULL,
    "country" TEXT NOT NULL,
    "iso3" TEXT NOT NULL,
    "currencyCodeId" INTEGER NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "State" (
    "id" SERIAL NOT NULL,
    "state" TEXT NOT NULL,
    "iso2" TEXT NOT NULL,
    "countryId" INTEGER NOT NULL,

    CONSTRAINT "State_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "id" SERIAL NOT NULL,
    "city" TEXT NOT NULL,
    "geom" geometry(Point,4326) NOT NULL,
    "countryId" INTEGER NOT NULL,
    "stateId" INTEGER,
    "timeZoneId" INTEGER NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventCategory" (
    "id" SERIAL NOT NULL,
    "eventCategory" TEXT NOT NULL,

    CONSTRAINT "EventCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventType" (
    "id" SERIAL NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventCategoryId" INTEGER,

    CONSTRAINT "EventType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "venueId" INTEGER NOT NULL,
    "locationId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "image" TEXT,
    "eventTypeId" INTEGER NOT NULL,
    "ageRestriction" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionCategory" (
    "id" SERIAL NOT NULL,
    "promotionCategory" TEXT NOT NULL,

    CONSTRAINT "PromotionCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionType" (
    "id" SERIAL NOT NULL,
    "promotionType" TEXT NOT NULL,
    "promotionCategoryId" INTEGER,

    CONSTRAINT "PromotionType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promotion" (
    "id" SERIAL NOT NULL,
    "venueId" INTEGER NOT NULL,
    "locationId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "image" TEXT,
    "ageRestriction" INTEGER NOT NULL,
    "promotionTypeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VenueType" (
    "id" SERIAL NOT NULL,
    "venueType" TEXT NOT NULL,

    CONSTRAINT "VenueType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MusicGenre" (
    "id" SERIAL NOT NULL,
    "venueId" INTEGER NOT NULL,
    "eventTypeId" INTEGER NOT NULL,

    CONSTRAINT "MusicGenre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venue" (
    "id" SERIAL NOT NULL,
    "locationId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "phoneNumber" TEXT,
    "email" TEXT,
    "opensAt" DOUBLE PRECISION NOT NULL,
    "closesAt" DOUBLE PRECISION NOT NULL,
    "ageRestriction" INTEGER NOT NULL,
    "isOutdoor" BOOLEAN NOT NULL,
    "isAccessible" BOOLEAN NOT NULL,
    "venueTypeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Performer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "description" TEXT NOT NULL,
    "locationId" INTEGER NOT NULL,
    "eventTypeId" INTEGER NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Performer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventPerformer" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "performerId" INTEGER NOT NULL,

    CONSTRAINT "EventPerformer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PermissionFor" (
    "id" SERIAL NOT NULL,
    "permissionFor" TEXT NOT NULL,

    CONSTRAINT "PermissionFor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PermissionType" (
    "id" SERIAL NOT NULL,
    "permissionType" TEXT NOT NULL,

    CONSTRAINT "PermissionType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPermission" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "permissionForId" INTEGER NOT NULL,
    "permissionTypeId" INTEGER NOT NULL,

    CONSTRAINT "UserPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationType" (
    "id" SERIAL NOT NULL,
    "notifcationType" TEXT NOT NULL,

    CONSTRAINT "NotificationType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationFor" (
    "id" SERIAL NOT NULL,
    "notificationFor" TEXT NOT NULL,

    CONSTRAINT "NotificationFor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserNotification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "notificationForId" INTEGER NOT NULL,
    "notificationTypeId" INTEGER NOT NULL,

    CONSTRAINT "UserNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "profileImage" TEXT,
    "verified" BOOLEAN NOT NULL,
    "roleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "eventId" INTEGER NOT NULL,
    "transactionId" INTEGER NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" SERIAL NOT NULL,
    "paymentMethod" TEXT NOT NULL,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentStatus" (
    "id" SERIAL NOT NULL,
    "paymentStatus" TEXT NOT NULL,

    CONSTRAINT "PaymentStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "eventId" INTEGER,
    "currencyCodeId" INTEGER NOT NULL,
    "transactionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "paymentMethodId" INTEGER NOT NULL,
    "paymentStatusId" INTEGER NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" SERIAL NOT NULL,
    "userRole" TEXT NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailToken" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "resends" INTEGER NOT NULL,
    "lastSentAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VenueClick" (
    "id" SERIAL NOT NULL,
    "venueId" INTEGER NOT NULL,
    "userId" INTEGER,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VenueClick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformerClick" (
    "id" SERIAL NOT NULL,
    "performerId" INTEGER NOT NULL,
    "userId" INTEGER,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerformerClick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventClick" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "userId" INTEGER,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventClick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionClick" (
    "id" SERIAL NOT NULL,
    "promotionId" INTEGER NOT NULL,
    "userId" INTEGER,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromotionClick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VenueTypeClick" (
    "id" SERIAL NOT NULL,
    "venueTypeId" INTEGER NOT NULL,
    "userId" INTEGER,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VenueTypeClick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventTypeClick" (
    "id" SERIAL NOT NULL,
    "eventTypeId" INTEGER NOT NULL,
    "userId" INTEGER,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventTypeClick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionTypeClick" (
    "id" SERIAL NOT NULL,
    "promotionTypeId" INTEGER NOT NULL,
    "userId" INTEGER,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromotionTypeClick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VenueDwellTime" (
    "id" SERIAL NOT NULL,
    "venueId" INTEGER NOT NULL,
    "userId" INTEGER,
    "duration" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VenueDwellTime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformerDwellTime" (
    "id" SERIAL NOT NULL,
    "performerId" INTEGER NOT NULL,
    "userId" INTEGER,
    "duration" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PerformerDwellTime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventDwellTime" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "userId" INTEGER,
    "duration" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventDwellTime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionDwellTime" (
    "id" SERIAL NOT NULL,
    "promotionId" INTEGER NOT NULL,
    "userId" INTEGER,
    "duration" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromotionDwellTime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VenueLike" (
    "id" SERIAL NOT NULL,
    "venueId" INTEGER NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "VenueLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformerLike" (
    "id" SERIAL NOT NULL,
    "performerId" INTEGER NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "PerformerLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventLike" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "EventLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionLike" (
    "id" SERIAL NOT NULL,
    "promotionId" INTEGER NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "PromotionLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VenueFollower" (
    "id" SERIAL NOT NULL,
    "venueId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "VenueFollower_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformerFollower" (
    "id" SERIAL NOT NULL,
    "performerId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "PerformerFollower_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventTypeFollower" (
    "id" SERIAL NOT NULL,
    "eventTypeId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "EventTypeFollower_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionTypeFollower" (
    "id" SERIAL NOT NULL,
    "promotionTypeId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "PromotionTypeFollower_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VenueTypePreference" (
    "id" SERIAL NOT NULL,
    "venueTypeId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "VenueTypePreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventTypePreference" (
    "id" SERIAL NOT NULL,
    "eventTypeId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "EventTypePreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionTypePreference" (
    "id" SERIAL NOT NULL,
    "promotionTypeId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "PromotionTypePreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventSave" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "EventSave_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionSave" (
    "id" SERIAL NOT NULL,
    "promotionId" INTEGER NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "PromotionSave_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkType" (
    "id" SERIAL NOT NULL,
    "linkType" TEXT NOT NULL,

    CONSTRAINT "LinkType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VenueLink" (
    "id" SERIAL NOT NULL,
    "link" TEXT NOT NULL,
    "linkTypeId" INTEGER NOT NULL,
    "venueId" INTEGER NOT NULL,

    CONSTRAINT "VenueLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformerLink" (
    "id" SERIAL NOT NULL,
    "link" TEXT NOT NULL,
    "linkTypeId" INTEGER NOT NULL,
    "performerId" INTEGER NOT NULL,

    CONSTRAINT "PerformerLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Location_cityId_idx" ON "Location"("cityId");

-- CreateIndex
CREATE INDEX "Location_lat_lng_idx" ON "Location"("lat", "lng");

-- CreateIndex
CREATE INDEX "City_city_idx" ON "City"("city");

-- CreateIndex
CREATE INDEX "Event_venueId_startDate_eventTypeId_idx" ON "Event"("venueId", "startDate", "eventTypeId");

-- CreateIndex
CREATE INDEX "Promotion_venueId_startDate_promotionTypeId_idx" ON "Promotion"("venueId", "startDate", "promotionTypeId");

-- CreateIndex
CREATE INDEX "MusicGenre_venueId_idx" ON "MusicGenre"("venueId");

-- CreateIndex
CREATE INDEX "Venue_venueTypeId_idx" ON "Venue"("venueTypeId");

-- CreateIndex
CREATE INDEX "Venue_locationId_idx" ON "Venue"("locationId");

-- CreateIndex
CREATE INDEX "EventPerformer_eventId_idx" ON "EventPerformer"("eventId");

-- CreateIndex
CREATE INDEX "EventPerformer_performerId_idx" ON "EventPerformer"("performerId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailToken_email_key" ON "EmailToken"("email");

-- CreateIndex
CREATE INDEX "EmailToken_token_idx" ON "EmailToken"("token");

-- CreateIndex
CREATE INDEX "VenueClick_venueId_date_idx" ON "VenueClick"("venueId", "date");

-- CreateIndex
CREATE INDEX "VenueClick_userId_idx" ON "VenueClick"("userId");

-- CreateIndex
CREATE INDEX "VenueClick_date_idx" ON "VenueClick"("date");

-- CreateIndex
CREATE INDEX "PerformerClick_performerId_date_idx" ON "PerformerClick"("performerId", "date");

-- CreateIndex
CREATE INDEX "PerformerClick_userId_idx" ON "PerformerClick"("userId");

-- CreateIndex
CREATE INDEX "PerformerClick_date_idx" ON "PerformerClick"("date");

-- CreateIndex
CREATE INDEX "EventClick_eventId_date_idx" ON "EventClick"("eventId", "date");

-- CreateIndex
CREATE INDEX "EventClick_userId_idx" ON "EventClick"("userId");

-- CreateIndex
CREATE INDEX "EventClick_date_idx" ON "EventClick"("date");

-- CreateIndex
CREATE INDEX "PromotionClick_promotionId_date_idx" ON "PromotionClick"("promotionId", "date");

-- CreateIndex
CREATE INDEX "PromotionClick_userId_idx" ON "PromotionClick"("userId");

-- CreateIndex
CREATE INDEX "PromotionClick_date_idx" ON "PromotionClick"("date");

-- CreateIndex
CREATE INDEX "VenueTypeClick_venueTypeId_date_idx" ON "VenueTypeClick"("venueTypeId", "date");

-- CreateIndex
CREATE INDEX "VenueTypeClick_userId_idx" ON "VenueTypeClick"("userId");

-- CreateIndex
CREATE INDEX "VenueTypeClick_date_idx" ON "VenueTypeClick"("date");

-- CreateIndex
CREATE INDEX "EventTypeClick_eventTypeId_date_idx" ON "EventTypeClick"("eventTypeId", "date");

-- CreateIndex
CREATE INDEX "EventTypeClick_userId_idx" ON "EventTypeClick"("userId");

-- CreateIndex
CREATE INDEX "EventTypeClick_date_idx" ON "EventTypeClick"("date");

-- CreateIndex
CREATE INDEX "PromotionTypeClick_promotionTypeId_date_idx" ON "PromotionTypeClick"("promotionTypeId", "date");

-- CreateIndex
CREATE INDEX "PromotionTypeClick_userId_idx" ON "PromotionTypeClick"("userId");

-- CreateIndex
CREATE INDEX "PromotionTypeClick_date_idx" ON "PromotionTypeClick"("date");

-- CreateIndex
CREATE INDEX "VenueLike_venueId_idx" ON "VenueLike"("venueId");

-- CreateIndex
CREATE INDEX "VenueLike_userId_idx" ON "VenueLike"("userId");

-- CreateIndex
CREATE INDEX "PerformerLike_performerId_idx" ON "PerformerLike"("performerId");

-- CreateIndex
CREATE INDEX "PerformerLike_userId_idx" ON "PerformerLike"("userId");

-- CreateIndex
CREATE INDEX "EventLike_eventId_idx" ON "EventLike"("eventId");

-- CreateIndex
CREATE INDEX "EventLike_userId_idx" ON "EventLike"("userId");

-- CreateIndex
CREATE INDEX "PromotionLike_promotionId_idx" ON "PromotionLike"("promotionId");

-- CreateIndex
CREATE INDEX "PromotionLike_userId_idx" ON "PromotionLike"("userId");

-- CreateIndex
CREATE INDEX "VenueFollower_venueId_idx" ON "VenueFollower"("venueId");

-- CreateIndex
CREATE INDEX "VenueFollower_userId_idx" ON "VenueFollower"("userId");

-- CreateIndex
CREATE INDEX "PerformerFollower_performerId_idx" ON "PerformerFollower"("performerId");

-- CreateIndex
CREATE INDEX "PerformerFollower_userId_idx" ON "PerformerFollower"("userId");

-- CreateIndex
CREATE INDEX "EventTypeFollower_eventTypeId_idx" ON "EventTypeFollower"("eventTypeId");

-- CreateIndex
CREATE INDEX "EventTypeFollower_userId_idx" ON "EventTypeFollower"("userId");

-- CreateIndex
CREATE INDEX "PromotionTypeFollower_promotionTypeId_idx" ON "PromotionTypeFollower"("promotionTypeId");

-- CreateIndex
CREATE INDEX "PromotionTypeFollower_userId_idx" ON "PromotionTypeFollower"("userId");

-- CreateIndex
CREATE INDEX "VenueTypePreference_venueTypeId_idx" ON "VenueTypePreference"("venueTypeId");

-- CreateIndex
CREATE INDEX "VenueTypePreference_userId_idx" ON "VenueTypePreference"("userId");

-- CreateIndex
CREATE INDEX "EventTypePreference_eventTypeId_idx" ON "EventTypePreference"("eventTypeId");

-- CreateIndex
CREATE INDEX "EventTypePreference_userId_idx" ON "EventTypePreference"("userId");

-- CreateIndex
CREATE INDEX "PromotionTypePreference_promotionTypeId_idx" ON "PromotionTypePreference"("promotionTypeId");

-- CreateIndex
CREATE INDEX "PromotionTypePreference_userId_idx" ON "PromotionTypePreference"("userId");

-- CreateIndex
CREATE INDEX "EventSave_userId_idx" ON "EventSave"("userId");

-- CreateIndex
CREATE INDEX "PromotionSave_userId_idx" ON "PromotionSave"("userId");

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Country" ADD CONSTRAINT "Country_currencyCodeId_fkey" FOREIGN KEY ("currencyCodeId") REFERENCES "CurrencyCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "State" ADD CONSTRAINT "State_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_timeZoneId_fkey" FOREIGN KEY ("timeZoneId") REFERENCES "TimeZone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventType" ADD CONSTRAINT "EventType_eventCategoryId_fkey" FOREIGN KEY ("eventCategoryId") REFERENCES "EventCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_eventTypeId_fkey" FOREIGN KEY ("eventTypeId") REFERENCES "EventType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionType" ADD CONSTRAINT "PromotionType_promotionCategoryId_fkey" FOREIGN KEY ("promotionCategoryId") REFERENCES "PromotionCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_promotionTypeId_fkey" FOREIGN KEY ("promotionTypeId") REFERENCES "PromotionType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusicGenre" ADD CONSTRAINT "MusicGenre_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusicGenre" ADD CONSTRAINT "MusicGenre_eventTypeId_fkey" FOREIGN KEY ("eventTypeId") REFERENCES "EventType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venue" ADD CONSTRAINT "Venue_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venue" ADD CONSTRAINT "Venue_venueTypeId_fkey" FOREIGN KEY ("venueTypeId") REFERENCES "VenueType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Performer" ADD CONSTRAINT "Performer_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Performer" ADD CONSTRAINT "Performer_eventTypeId_fkey" FOREIGN KEY ("eventTypeId") REFERENCES "EventType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventPerformer" ADD CONSTRAINT "EventPerformer_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventPerformer" ADD CONSTRAINT "EventPerformer_performerId_fkey" FOREIGN KEY ("performerId") REFERENCES "Performer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_permissionForId_fkey" FOREIGN KEY ("permissionForId") REFERENCES "PermissionFor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_permissionTypeId_fkey" FOREIGN KEY ("permissionTypeId") REFERENCES "PermissionType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNotification" ADD CONSTRAINT "UserNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNotification" ADD CONSTRAINT "UserNotification_notificationForId_fkey" FOREIGN KEY ("notificationForId") REFERENCES "NotificationFor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNotification" ADD CONSTRAINT "UserNotification_notificationTypeId_fkey" FOREIGN KEY ("notificationTypeId") REFERENCES "NotificationType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "UserRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_currencyCodeId_fkey" FOREIGN KEY ("currencyCodeId") REFERENCES "CurrencyCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_paymentStatusId_fkey" FOREIGN KEY ("paymentStatusId") REFERENCES "PaymentStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueClick" ADD CONSTRAINT "VenueClick_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueClick" ADD CONSTRAINT "VenueClick_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformerClick" ADD CONSTRAINT "PerformerClick_performerId_fkey" FOREIGN KEY ("performerId") REFERENCES "Performer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformerClick" ADD CONSTRAINT "PerformerClick_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventClick" ADD CONSTRAINT "EventClick_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventClick" ADD CONSTRAINT "EventClick_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionClick" ADD CONSTRAINT "PromotionClick_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionClick" ADD CONSTRAINT "PromotionClick_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueTypeClick" ADD CONSTRAINT "VenueTypeClick_venueTypeId_fkey" FOREIGN KEY ("venueTypeId") REFERENCES "VenueType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueTypeClick" ADD CONSTRAINT "VenueTypeClick_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTypeClick" ADD CONSTRAINT "EventTypeClick_eventTypeId_fkey" FOREIGN KEY ("eventTypeId") REFERENCES "EventType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTypeClick" ADD CONSTRAINT "EventTypeClick_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionTypeClick" ADD CONSTRAINT "PromotionTypeClick_promotionTypeId_fkey" FOREIGN KEY ("promotionTypeId") REFERENCES "PromotionType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionTypeClick" ADD CONSTRAINT "PromotionTypeClick_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueDwellTime" ADD CONSTRAINT "VenueDwellTime_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueDwellTime" ADD CONSTRAINT "VenueDwellTime_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformerDwellTime" ADD CONSTRAINT "PerformerDwellTime_performerId_fkey" FOREIGN KEY ("performerId") REFERENCES "Performer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformerDwellTime" ADD CONSTRAINT "PerformerDwellTime_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventDwellTime" ADD CONSTRAINT "EventDwellTime_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventDwellTime" ADD CONSTRAINT "EventDwellTime_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionDwellTime" ADD CONSTRAINT "PromotionDwellTime_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionDwellTime" ADD CONSTRAINT "PromotionDwellTime_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueLike" ADD CONSTRAINT "VenueLike_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueLike" ADD CONSTRAINT "VenueLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformerLike" ADD CONSTRAINT "PerformerLike_performerId_fkey" FOREIGN KEY ("performerId") REFERENCES "Performer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformerLike" ADD CONSTRAINT "PerformerLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventLike" ADD CONSTRAINT "EventLike_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventLike" ADD CONSTRAINT "EventLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionLike" ADD CONSTRAINT "PromotionLike_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionLike" ADD CONSTRAINT "PromotionLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueFollower" ADD CONSTRAINT "VenueFollower_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueFollower" ADD CONSTRAINT "VenueFollower_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformerFollower" ADD CONSTRAINT "PerformerFollower_performerId_fkey" FOREIGN KEY ("performerId") REFERENCES "Performer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformerFollower" ADD CONSTRAINT "PerformerFollower_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTypeFollower" ADD CONSTRAINT "EventTypeFollower_eventTypeId_fkey" FOREIGN KEY ("eventTypeId") REFERENCES "EventType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTypeFollower" ADD CONSTRAINT "EventTypeFollower_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionTypeFollower" ADD CONSTRAINT "PromotionTypeFollower_promotionTypeId_fkey" FOREIGN KEY ("promotionTypeId") REFERENCES "PromotionType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionTypeFollower" ADD CONSTRAINT "PromotionTypeFollower_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueTypePreference" ADD CONSTRAINT "VenueTypePreference_venueTypeId_fkey" FOREIGN KEY ("venueTypeId") REFERENCES "VenueType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueTypePreference" ADD CONSTRAINT "VenueTypePreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTypePreference" ADD CONSTRAINT "EventTypePreference_eventTypeId_fkey" FOREIGN KEY ("eventTypeId") REFERENCES "EventType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTypePreference" ADD CONSTRAINT "EventTypePreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionTypePreference" ADD CONSTRAINT "PromotionTypePreference_promotionTypeId_fkey" FOREIGN KEY ("promotionTypeId") REFERENCES "PromotionType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionTypePreference" ADD CONSTRAINT "PromotionTypePreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSave" ADD CONSTRAINT "EventSave_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSave" ADD CONSTRAINT "EventSave_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionSave" ADD CONSTRAINT "PromotionSave_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionSave" ADD CONSTRAINT "PromotionSave_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueLink" ADD CONSTRAINT "VenueLink_linkTypeId_fkey" FOREIGN KEY ("linkTypeId") REFERENCES "LinkType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueLink" ADD CONSTRAINT "VenueLink_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformerLink" ADD CONSTRAINT "PerformerLink_linkTypeId_fkey" FOREIGN KEY ("linkTypeId") REFERENCES "LinkType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformerLink" ADD CONSTRAINT "PerformerLink_performerId_fkey" FOREIGN KEY ("performerId") REFERENCES "Performer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
