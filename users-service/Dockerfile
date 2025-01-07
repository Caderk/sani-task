# STEP 1: Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy the .csproj and restore as distinct layers
COPY ./UsersService.csproj .
RUN dotnet restore

# Copy everything else and build
COPY . .
RUN dotnet publish -c Release -o out

# STEP 2: Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

COPY --from=build /app/out ./

# Expose port 3010 for the service
EXPOSE 3010

ENTRYPOINT ["dotnet", "UsersService.dll"]
