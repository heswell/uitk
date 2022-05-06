import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  tap,
} from "rxjs";
import { Rng } from "../Rng";

export function createVisibleRowRange<T>(
  scrollTop$: BehaviorSubject<number>,
  clientMiddleHeight$: BehaviorSubject<number>,
  rowHeight$: BehaviorSubject<number>,
  data$: BehaviorSubject<T[]>
) {
  const visibleRowRange$ = new BehaviorSubject<Rng>(Rng.empty);
  combineLatest([scrollTop$, clientMiddleHeight$, rowHeight$, data$])
    .pipe(
      map(([scrollTop, clientMiddleHeight, rowHeight, data]) => {
        // console.log(
        //   `Calculating visibleRowRange. scrollTop: ${scrollTop}, clientMiddleHeight: ${clientMiddleHeight}, rowHeight: ${rowHeight}, data.length: ${data.length}`
        // );
        if (rowHeight < 1) {
          // console.log(`rowHeight < 1, returning empty range`);
          return Rng.empty;
        }
        const start = Math.floor(scrollTop / rowHeight);
        let end = Math.max(
          start,
          Math.ceil((scrollTop + clientMiddleHeight) / rowHeight)
        );
        if (end > data.length) {
          end = data.length;
        }
        // console.log(`visibleRowRange: ${start} - ${end}`);
        return new Rng(start, end);
      }),
      distinctUntilChanged((a, b) => Rng.equals(a, b))
      // tap((rng) => {
      //   console.log(`visibleRowRange$: ${rng}`);
      // })
    )
    .subscribe(visibleRowRange$);
  return visibleRowRange$;
}
