import { asyncScheduler, defer, map, Observable, of, Subject, Subscriber } from 'rxjs';

// Observable
const observable = new Observable<number>((subscriber) => {
    subscriber.next(1);
    subscriber.next(2);
    subscriber.next(3);
    setTimeout(() => {
        subscriber.next(4);
        subscriber.error("error");
        subscriber.complete();
    }, 1000);
});

// Observer
observable.subscribe({
    next: (x: number) => {
        console.log(x);
    },
    error: (error) => {
        console.log(error);
    },
    complete: () => {
        console.log("complete");
    }
})

// Subscription
const temp = observable.pipe(map( (x: number) => {return x * 2}));

// Subjects
const subject = new Subject<string>();
subject.subscribe({
    next: (v) => { console.log(v)}
})

subject.next("a");
subject.next("b");
subject.next("c");

// Scheduler
asyncScheduler.schedule(
    (x) => console.log(x),
    2000,
    5
)
