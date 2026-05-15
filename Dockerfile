FROM maven:3.9.6-eclipse-temurin-17 AS build

WORKDIR /app

COPY backend/weight-management .

RUN mvn clean package -DskipTests

FROM eclipse-temurin:17

WORKDIR /app

COPY --from=build /app/target/weight-management-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java","-jar","