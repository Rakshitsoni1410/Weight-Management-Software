FROM eclipse-temurin:17

WORKDIR /app

COPY backend/weight-management/target/weight-management-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java","-jar","app.jar"]