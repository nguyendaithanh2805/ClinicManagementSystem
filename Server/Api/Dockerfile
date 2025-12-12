FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY *.sln .
COPY Server/Api/Api.csproj Server/Api/
COPY Server/Application/Application.csproj Server/Application/
COPY Server/Domain/Domain.csproj Server/Domain/
COPY Server/Infrastructure/Infrastructure.csproj Server/Infrastructure/
RUN dotnet restore "Server/Api/Api.csproj"

COPY . .

WORKDIR /src/Server/Api
RUN dotnet publish "Api.csproj" -c Release -o /app/publish


FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

COPY --from=build /app/publish ./

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "Api.dll"]
