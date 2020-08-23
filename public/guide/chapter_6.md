# Types of the projects
Couple afterwords.

## Hybrid application
It is possible to have a application that uses several protocols. 
For example, code below can listen both HTTP 8888 and TCP 9092 ports.  
```
async function bootstrap(config) {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'clientExampleId',
        brokers: [localhost:9092],
      },
    },
  });

  await app.listen(8888);
  await app.startAllMicroservicesAsync();
}
```

## Microservice application
Read more [about microservices](https://docs.nestjs.com/microservices/basics). In a nutshell to work with, for example, Kafka messages you need to 
1. send event with
```typescript
thisClientKafka
  .emit<number>('event_token', JSON.stringify(payload))
  .toPromise();
```
2. receive event with
```typescript
@EventPattern('event_token')
async exampeControllerMethod(
   @Payload() payload: { partition: string; value: EventDto },
 ) { 
...
}
```

## In between Monorepo, Library, Microservice/API
This table may help you to choose the right template for your project based on its properties.


| Microservice/API | Shared library | Monorepo |
| -------- | -------- | -------- |
| Provides a minimal enough single-responsibility business feature can't be more divided into sub-microservices (e.g., NPI providers encoder-decoder) | Provides a set of shared helpers, utils, other reusable code combined by the single-responsibility principle. | It provides a complex single-responsibility business feature that can be divided into a set of microservices (e.g., a UI for sales and customers to manage their campaigns). |
| Naturally, runnable application service that responds to other services requests. | It cannot be launched as an application, no `main.js` file; always a part of an application. | It's a runnable main application with optional sub-applications with one package.json for the whole workspace with the shared codebase,  artifacts, installed node modules, etc. |
| Ready to reuse in other company products; minimal external coupled, high internal cohesion, ideally with personal database. | It can be internal or shared depending on is the library used by one project or many (e.g., Crypto encoder-decoder for User identification service vs. database providers). | Product-specific non-reusable end-service. |
